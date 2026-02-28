"""
Performance Metrics Skill
Pull campaign, ad group, and keyword-level performance data.
Impressions, CTR, CPC, CPA, Conversion Rate, ROAS.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from google_ads_client import get_client, get_customer_id, run_query


# ─── GAQL Queries ────────────────────────────────────────────

CAMPAIGN_PERF_QUERY = """
    SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.bidding_strategy_type,
        campaign_budget.amount_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.conversions_from_interactions_rate,
        metrics.cost_micros,
        metrics.all_conversions_value
    FROM campaign
    WHERE segments.date DURING {date_range}
        AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
"""

AD_GROUP_PERF_QUERY = """
    SELECT
        campaign.name,
        ad_group.id,
        ad_group.name,
        ad_group.status,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.conversions_from_interactions_rate,
        metrics.cost_micros
    FROM ad_group
    WHERE segments.date DURING {date_range}
        AND ad_group.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
"""

AD_PERF_QUERY = """
    SELECT
        campaign.name,
        ad_group.name,
        ad_group_ad.ad.id,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group_ad.status,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.cost_micros
    FROM ad_group_ad
    WHERE segments.date DURING {date_range}
        AND ad_group_ad.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
    LIMIT 100
"""

DAILY_PERF_QUERY = """
    SELECT
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.average_cpc,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.cost_micros
    FROM campaign
    WHERE segments.date DURING {date_range}
    ORDER BY segments.date DESC
"""


# ─── Data Extraction ────────────────────────────────────────

def get_campaign_performance(date_range: str = "LAST_30_DAYS") -> list[dict]:
    """Pull campaign-level performance metrics."""
    client = get_client()
    customer_id = get_customer_id()
    query = CAMPAIGN_PERF_QUERY.format(date_range=date_range)
    rows = run_query(client, customer_id, query)

    results = []
    for row in rows:
        budget_micros = row.campaign_budget.amount_micros if row.campaign_budget.amount_micros else 0
        conv_value = row.metrics.all_conversions_value if row.metrics.all_conversions_value else 0
        cost = row.metrics.cost_micros / 1_000_000

        results.append({
            "campaign_id": row.campaign.id,
            "campaign": row.campaign.name,
            "status": row.campaign.status.name,
            "bidding_strategy": row.campaign.bidding_strategy_type.name,
            "daily_budget": budget_micros / 1_000_000,
            "impressions": row.metrics.impressions,
            "clicks": row.metrics.clicks,
            "ctr": round(row.metrics.ctr * 100, 2),
            "avg_cpc": row.metrics.average_cpc / 1_000_000,
            "conversions": row.metrics.conversions,
            "cpa": row.metrics.cost_per_conversion / 1_000_000 if row.metrics.cost_per_conversion else 0,
            "conversion_rate": round(row.metrics.conversions_from_interactions_rate * 100, 2),
            "cost": cost,
            "conversion_value": conv_value,
            "roas": round(conv_value / cost, 2) if cost > 0 else 0,
        })
    return results


def get_ad_group_performance(date_range: str = "LAST_30_DAYS") -> list[dict]:
    """Pull ad-group-level performance metrics."""
    client = get_client()
    customer_id = get_customer_id()
    query = AD_GROUP_PERF_QUERY.format(date_range=date_range)
    rows = run_query(client, customer_id, query)

    results = []
    for row in rows:
        results.append({
            "campaign": row.campaign.name,
            "ad_group_id": row.ad_group.id,
            "ad_group": row.ad_group.name,
            "status": row.ad_group.status.name,
            "impressions": row.metrics.impressions,
            "clicks": row.metrics.clicks,
            "ctr": round(row.metrics.ctr * 100, 2),
            "avg_cpc": row.metrics.average_cpc / 1_000_000,
            "conversions": row.metrics.conversions,
            "cpa": row.metrics.cost_per_conversion / 1_000_000 if row.metrics.cost_per_conversion else 0,
            "conversion_rate": round(row.metrics.conversions_from_interactions_rate * 100, 2),
            "cost": row.metrics.cost_micros / 1_000_000,
        })
    return results


def get_ad_performance(date_range: str = "LAST_30_DAYS") -> list[dict]:
    """Pull ad-level performance for copy testing analysis."""
    client = get_client()
    customer_id = get_customer_id()
    query = AD_PERF_QUERY.format(date_range=date_range)
    rows = run_query(client, customer_id, query)

    results = []
    for row in rows:
        # Extract responsive search ad parts
        headlines = []
        descriptions = []
        try:
            for h in row.ad_group_ad.ad.responsive_search_ad.headlines:
                headlines.append(h.text)
            for d in row.ad_group_ad.ad.responsive_search_ad.descriptions:
                descriptions.append(d.text)
        except AttributeError:
            pass

        results.append({
            "campaign": row.campaign.name,
            "ad_group": row.ad_group.name,
            "ad_id": row.ad_group_ad.ad.id,
            "headlines": headlines,
            "descriptions": descriptions,
            "status": row.ad_group_ad.status.name,
            "impressions": row.metrics.impressions,
            "clicks": row.metrics.clicks,
            "ctr": round(row.metrics.ctr * 100, 2),
            "avg_cpc": row.metrics.average_cpc / 1_000_000,
            "conversions": row.metrics.conversions,
            "cpa": row.metrics.cost_per_conversion / 1_000_000 if row.metrics.cost_per_conversion else 0,
            "cost": row.metrics.cost_micros / 1_000_000,
        })
    return results


def get_daily_performance(date_range: str = "LAST_30_DAYS") -> list[dict]:
    """Pull daily aggregate metrics for trend analysis."""
    client = get_client()
    customer_id = get_customer_id()
    query = DAILY_PERF_QUERY.format(date_range=date_range)
    rows = run_query(client, customer_id, query)

    # Aggregate by date
    by_date: dict[str, dict] = {}
    for row in rows:
        d = row.segments.date
        if d not in by_date:
            by_date[d] = {
                "date": d,
                "impressions": 0, "clicks": 0, "conversions": 0.0,
                "cost_micros": 0, "cpc_total": 0.0, "cpc_count": 0,
            }
        entry = by_date[d]
        entry["impressions"] += row.metrics.impressions
        entry["clicks"] += row.metrics.clicks
        entry["conversions"] += row.metrics.conversions
        entry["cost_micros"] += row.metrics.cost_micros
        if row.metrics.average_cpc:
            entry["cpc_total"] += row.metrics.average_cpc
            entry["cpc_count"] += 1

    results = []
    for d in sorted(by_date.keys(), reverse=True):
        e = by_date[d]
        cost = e["cost_micros"] / 1_000_000
        results.append({
            "date": e["date"],
            "impressions": e["impressions"],
            "clicks": e["clicks"],
            "ctr": round((e["clicks"] / e["impressions"] * 100) if e["impressions"] > 0 else 0, 2),
            "avg_cpc": round((e["cpc_total"] / e["cpc_count"] / 1_000_000) if e["cpc_count"] > 0 else 0, 2),
            "conversions": e["conversions"],
            "cpa": round(cost / e["conversions"], 2) if e["conversions"] > 0 else 0,
            "cost": round(cost, 2),
        })
    return results


# ─── Summary ─────────────────────────────────────────────────

def get_account_summary(date_range: str = "LAST_30_DAYS") -> dict:
    """Generate a high-level account summary."""
    campaigns = get_campaign_performance(date_range)

    total_impressions = sum(c["impressions"] for c in campaigns)
    total_clicks = sum(c["clicks"] for c in campaigns)
    total_conversions = sum(c["conversions"] for c in campaigns)
    total_cost = sum(c["cost"] for c in campaigns)
    total_value = sum(c["conversion_value"] for c in campaigns)

    return {
        "active_campaigns": len([c for c in campaigns if c["status"] == "ENABLED"]),
        "total_impressions": total_impressions,
        "total_clicks": total_clicks,
        "overall_ctr": round((total_clicks / total_impressions * 100) if total_impressions > 0 else 0, 2),
        "total_conversions": total_conversions,
        "total_cost": round(total_cost, 2),
        "overall_cpa": round(total_cost / total_conversions, 2) if total_conversions > 0 else 0,
        "overall_cpc": round(total_cost / total_clicks, 2) if total_clicks > 0 else 0,
        "overall_conversion_rate": round((total_conversions / total_clicks * 100) if total_clicks > 0 else 0, 2),
        "total_conversion_value": round(total_value, 2),
        "overall_roas": round(total_value / total_cost, 2) if total_cost > 0 else 0,
        "campaigns": campaigns,
    }


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    from tabulate import tabulate

    summary = get_account_summary()
    print("\n═══ ACCOUNT SUMMARY (Last 30 Days) ═══")
    for k, v in summary.items():
        if k != "campaigns":
            print(f"  {k}: {v}")

    print("\n═══ CAMPAIGN PERFORMANCE ═══")
    if summary["campaigns"]:
        display_cols = ["campaign", "status", "impressions", "clicks", "ctr", "conversions", "cpa", "cost", "roas"]
        display = [{k: c[k] for k in display_cols} for c in summary["campaigns"]]
        print(tabulate(display, headers="keys", floatfmt=".2f"))
