"""
Daily Summary Report
Generates and sends a daily metrics summary.
"""

from __future__ import annotations
import sys, os
from datetime import datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from skills.data_gathering.performance import get_account_summary, get_daily_performance
from skills.data_gathering.budget import get_budget_status, check_spend_cap
from skills.data_gathering.search_terms import find_negative_candidates, find_expansion_candidates
from db import log_report, get_action_summary


def generate_daily_summary() -> str:
    """
    Generate a daily summary report with key metrics.
    """
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    summary = get_account_summary("TODAY")
    cap = check_spend_cap()
    budgets = get_budget_status()
    action_summary = get_action_summary(days=1)

    lines = [
        f"📊 FOC DAILY ADS REPORT — {now}",
        "═" * 45,
        "",
        "📈 TODAY'S METRICS",
        f"  Impressions:      {summary['total_impressions']:,}",
        f"  Clicks:           {summary['total_clicks']:,}",
        f"  CTR:              {summary['overall_ctr']}%",
        f"  Conversions:      {summary['total_conversions']:.0f}",
        f"  CPA:              ${summary['overall_cpa']:.2f}",
        f"  CPC:              ${summary['overall_cpc']:.2f}",
        f"  Total Spend:      ${summary['total_cost']:.2f}",
        f"  Conversion Rate:  {summary['overall_conversion_rate']}%",
        "",
        f"💰 BUDGET STATUS — {cap['status']}",
        f"  Daily Cap:        ${cap['max_daily_spend']:.2f}",
        f"  Today's Spend:    ${cap['total_today_spend']:.2f} ({cap['pct_of_cap']}%)",
    ]

    # Campaign breakdown
    if budgets:
        lines.append("")
        lines.append("📋 CAMPAIGN BREAKDOWN")
        for b in budgets:
            lines.append(f"  {b['campaign']}: ${b['today_spend']:.2f} / ${b['daily_budget']:.2f} — {b['pacing_status']}")

    # Recommendations
    neg_candidates = find_negative_candidates()
    exp_candidates = find_expansion_candidates()

    if neg_candidates or exp_candidates:
        lines.append("")
        lines.append("💡 RECOMMENDATIONS")
        if neg_candidates:
            lines.append(f"  ⚠️ {len(neg_candidates)} search terms wasting budget (${sum(c['cost'] for c in neg_candidates):.2f} total)")
            for c in neg_candidates[:3]:
                lines.append(f"     → \"{c['search_term']}\" — {c['clicks']} clicks, $0 conversions")

        if exp_candidates:
            lines.append(f"  🚀 {len(exp_candidates)} converting terms not yet added as keywords")
            for c in exp_candidates[:3]:
                lines.append(f"     → \"{c['search_term']}\" — {c['conversions']:.0f} conversions at ${c['cost_per_conversion']:.2f} CPA")

    # Agent activity
    if action_summary:
        lines.append("")
        lines.append("🤖 AGENT ACTIVITY TODAY")
        for action_type, count in action_summary.items():
            lines.append(f"  {action_type}: {count}")

    report = "\n".join(lines)

    # Save to DB
    log_report("daily_summary", report, "TODAY")
    return report


def send_report(report: str, channel: str | None = None):
    """
    Send a report via the configured notification channel.
    Currently supports: console, slack, telegram.
    """
    if channel is None:
        channel = os.getenv("NOTIFICATION_CHANNEL", "console")

    if channel == "console":
        print(report)

    elif channel == "slack":
        import requests
        webhook = os.getenv("SLACK_WEBHOOK_URL")
        if webhook:
            requests.post(webhook, json={"text": f"```\n{report}\n```"})
        else:
            print("[WARN] SLACK_WEBHOOK_URL not set, printing to console")
            print(report)

    elif channel == "telegram":
        import requests
        token = os.getenv("TELEGRAM_BOT_TOKEN")
        chat_id = os.getenv("TELEGRAM_CHAT_ID")
        if token and chat_id:
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            # Telegram has a 4096 char limit, split if needed
            for i in range(0, len(report), 4000):
                chunk = report[i:i+4000]
                requests.post(url, data={"chat_id": chat_id, "text": chunk, "parse_mode": "Markdown"})
        else:
            print("[WARN] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set")
            print(report)

    else:
        print(report)


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    report = generate_daily_summary()
    send_report(report)
