"""
Budget Monitoring Skill
Track daily/monthly spend against budget, calculate pacing, and alert anomalies.
"""

from __future__ import annotations
import sys, os
from datetime import datetime, timedelta
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from google_ads_client import get_client, get_customer_id, run_query, get_env_float


BUDGET_QUERY = """
    SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign_budget.amount_micros,
        campaign_budget.total_amount_micros,
        metrics.cost_micros
    FROM campaign
    WHERE segments.date DURING {date_range}
        AND campaign.status = 'ENABLED'
"""

DAILY_SPEND_QUERY = """
    SELECT
        segments.date,
        campaign.name,
        metrics.cost_micros
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
        AND campaign.status != 'REMOVED'
    ORDER BY segments.date DESC
"""


def get_budget_status() -> list[dict]:
    """
    Get budget allocation and spend for each active campaign.
    Returns list of dicts with campaign, daily budget, spend today, and pacing.
    """
    client = get_client()
    customer_id = get_customer_id()

    # Today's spend
    rows_today = run_query(client, customer_id, BUDGET_QUERY.format(date_range="TODAY"))
    # This month's spend
    rows_month = run_query(client, customer_id, BUDGET_QUERY.format(date_range="THIS_MONTH"))

    # Aggregate monthly spend by campaign
    monthly_spend: dict[str, float] = {}
    for row in rows_month:
        name = row.campaign.name
        monthly_spend[name] = monthly_spend.get(name, 0) + row.metrics.cost_micros / 1_000_000

    results = []
    for row in rows_today:
        daily_budget = row.campaign_budget.amount_micros / 1_000_000 if row.campaign_budget.amount_micros else 0
        today_spend = row.metrics.cost_micros / 1_000_000
        campaign_name = row.campaign.name

        # Calculate monthly budget (daily * 30.4)
        monthly_budget = daily_budget * 30.4
        month_spend = monthly_spend.get(campaign_name, 0)

        # Pacing: what % of expected spend has been used
        today = datetime.now()
        day_of_month = today.day
        days_in_month = 30  # approximate
        expected_spend = (day_of_month / days_in_month) * monthly_budget
        pacing_pct = round((month_spend / expected_spend * 100) if expected_spend > 0 else 0, 1)

        # Pacing status
        if pacing_pct > 120:
            pacing_status = "⚠️ OVER-PACING"
        elif pacing_pct < 80:
            pacing_status = "⚠️ UNDER-PACING"
        else:
            pacing_status = "✅ ON TRACK"

        results.append({
            "campaign": campaign_name,
            "daily_budget": round(daily_budget, 2),
            "today_spend": round(today_spend, 2),
            "today_pct": round((today_spend / daily_budget * 100) if daily_budget > 0 else 0, 1),
            "monthly_budget": round(monthly_budget, 2),
            "month_spend": round(month_spend, 2),
            "month_pct": round((month_spend / monthly_budget * 100) if monthly_budget > 0 else 0, 1),
            "pacing_pct": pacing_pct,
            "pacing_status": pacing_status,
        })
    return results


def get_daily_spend_trend() -> list[dict]:
    """
    Get daily spend for the last 30 days, aggregated across campaigns.
    """
    client = get_client()
    customer_id = get_customer_id()
    rows = run_query(client, customer_id, DAILY_SPEND_QUERY)

    by_date: dict[str, float] = {}
    for row in rows:
        d = row.segments.date
        by_date[d] = by_date.get(d, 0) + row.metrics.cost_micros / 1_000_000

    results = []
    for d in sorted(by_date.keys(), reverse=True):
        results.append({"date": d, "spend": round(by_date[d], 2)})
    return results


def check_spend_cap() -> dict:
    """
    Check if total daily spend is approaching or exceeding the hard cap.
    Returns cap info and whether to halt bid increases.
    """
    max_daily = get_env_float("MAX_DAILY_SPEND", 50.0)
    budgets = get_budget_status()
    total_today = sum(b["today_spend"] for b in budgets)

    pct_of_cap = round((total_today / max_daily * 100) if max_daily > 0 else 0, 1)
    halt_increases = pct_of_cap >= 90

    return {
        "max_daily_spend": max_daily,
        "total_today_spend": round(total_today, 2),
        "pct_of_cap": pct_of_cap,
        "halt_bid_increases": halt_increases,
        "status": "🛑 CAP REACHED" if pct_of_cap >= 100 else ("⚠️ NEAR CAP" if halt_increases else "✅ WITHIN CAP"),
    }


def get_budget_alerts() -> list[dict]:
    """
    Generate budget-related alerts.
    """
    alerts = []
    budgets = get_budget_status()
    cap = check_spend_cap()

    # Campaign-level alerts
    for b in budgets:
        if b["pacing_pct"] > 120:
            alerts.append({
                "level": "WARNING",
                "campaign": b["campaign"],
                "message": f"Over-pacing at {b['pacing_pct']}% — ${b['month_spend']:.2f} spent of ${b['monthly_budget']:.2f} expected",
            })
        elif b["pacing_pct"] < 60:
            alerts.append({
                "level": "INFO",
                "campaign": b["campaign"],
                "message": f"Under-pacing at {b['pacing_pct']}% — only ${b['month_spend']:.2f} of ${b['monthly_budget']:.2f} expected",
            })

    # Account-level cap alert
    if cap["halt_bid_increases"]:
        alerts.append({
            "level": "CRITICAL",
            "campaign": "ALL",
            "message": f"Daily spend at {cap['pct_of_cap']}% of ${cap['max_daily_spend']:.2f} cap — bid increases HALTED",
        })

    return alerts


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    from tabulate import tabulate

    print("\n═══ BUDGET STATUS ═══")
    budgets = get_budget_status()
    if budgets:
        print(tabulate(budgets, headers="keys", floatfmt=".2f"))

    print("\n═══ SPEND CAP CHECK ═══")
    cap = check_spend_cap()
    for k, v in cap.items():
        print(f"  {k}: {v}")

    print("\n═══ BUDGET ALERTS ═══")
    alerts = get_budget_alerts()
    if alerts:
        for a in alerts:
            print(f"  [{a['level']}] {a['campaign']}: {a['message']}")
    else:
        print("  No alerts")
