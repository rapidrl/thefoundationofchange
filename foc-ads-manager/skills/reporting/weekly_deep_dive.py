"""
Weekly Deep Dive Report
Comprehensive weekly analysis with trends, recommendations, and optimization insights.
"""

from __future__ import annotations
import sys, os
from datetime import datetime
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from skills.data_gathering.performance import get_account_summary, get_daily_performance, get_ad_performance
from skills.data_gathering.budget import get_budget_status, get_daily_spend_trend
from skills.data_gathering.search_terms import (
    get_search_terms, get_keywords,
    find_negative_candidates, find_expansion_candidates,
)
from skills.actions.ad_copy_tester import get_ad_test_summary
from skills.actions.bid_optimizer import analyze_bids
from db import log_report, get_action_summary, get_recent_actions
from google_ads_client import get_env_float


def generate_weekly_report() -> str:
    """Generate a comprehensive weekly deep-dive report."""
    now = datetime.now().strftime("%Y-%m-%d")
    target_cpa = get_env_float("TARGET_CPA", 25.0)

    # Gather data
    summary = get_account_summary("LAST_7_DAYS")
    daily = get_daily_performance("LAST_7_DAYS")
    search_terms = get_search_terms("LAST_7_DAYS")
    keywords = get_keywords()
    negatives = find_negative_candidates(search_terms)
    expansions = find_expansion_candidates(search_terms, keywords)
    bid_recs = analyze_bids(target_cpa)
    actions = get_recent_actions(100)
    action_counts = get_action_summary(days=7)

    lines = [
        f"📊 FOC WEEKLY DEEP DIVE — Week of {now}",
        "═" * 55,
        "",
        "━━━ 1. ACCOUNT OVERVIEW ━━━",
        f"  Active Campaigns:   {summary['active_campaigns']}",
        f"  Total Impressions:  {summary['total_impressions']:,}",
        f"  Total Clicks:       {summary['total_clicks']:,}",
        f"  Overall CTR:        {summary['overall_ctr']}%",
        f"  Total Conversions:  {summary['total_conversions']:.0f}",
        f"  Overall CPA:        ${summary['overall_cpa']:.2f} (target: ${target_cpa:.2f})",
        f"  Conversion Rate:    {summary['overall_conversion_rate']}%",
        f"  Total Spend:        ${summary['total_cost']:.2f}",
        f"  ROAS:               {summary['overall_roas']}x",
    ]

    # CPA analysis
    if summary['overall_cpa'] > 0:
        cpa_vs_target = ((summary['overall_cpa'] - target_cpa) / target_cpa * 100)
        if cpa_vs_target < -10:
            lines.append(f"  → ✅ CPA is {abs(cpa_vs_target):.0f}% BELOW target — performing well!")
        elif cpa_vs_target > 20:
            lines.append(f"  → ⚠️ CPA is {cpa_vs_target:.0f}% ABOVE target — optimization needed")
        else:
            lines.append(f"  → CPA is within {abs(cpa_vs_target):.0f}% of target — on track")

    # Daily trend
    if daily:
        lines.extend(["", "━━━ 2. DAILY TREND ━━━"])
        for d in daily[:7]:
            bar = "█" * min(int(d["cost"] / max(dd["cost"] for dd in daily) * 20), 20) if daily else ""
            lines.append(f"  {d['date']}  ${d['cost']:>7.2f}  {d['clicks']:>4} clicks  {d['conversions']:>3.0f} conv  {bar}")

    # Campaign performance
    if summary["campaigns"]:
        lines.extend(["", "━━━ 3. CAMPAIGN PERFORMANCE ━━━"])
        for c in summary["campaigns"]:
            status_icon = "🟢" if c["status"] == "ENABLED" else "🔴"
            lines.append(f"  {status_icon} {c['campaign']}")
            lines.append(f"     Spend: ${c['cost']:.2f} | Clicks: {c['clicks']} | Conv: {c['conversions']:.0f} | CPA: ${c['cpa']:.2f} | CTR: {c['ctr']}%")

    # Search term insights
    lines.extend(["", "━━━ 4. SEARCH TERM INSIGHTS ━━━"])

    if search_terms:
        # Top performing terms
        converting = [t for t in search_terms if t["conversions"] > 0]
        converting.sort(key=lambda x: x["conversions"], reverse=True)
        if converting:
            lines.append("  🏆 Top Converting Search Terms:")
            for t in converting[:5]:
                lines.append(f"     \"{t['search_term']}\" — {t['conversions']:.0f} conv, ${t['cost_per_conversion']:.2f} CPA")

        # High impressions, low CTR
        low_ctr = [t for t in search_terms if t["impressions"] > 100 and t["ctr"] < 1.0]
        if low_ctr:
            lines.append(f"  📉 {len(low_ctr)} terms with high impressions but <1% CTR")

    # Negative keyword recommendations
    if negatives:
        lines.extend(["", "━━━ 5. NEGATIVE KEYWORD RECOMMENDATIONS ━━━"])
        total_waste = sum(c["cost"] for c in negatives)
        lines.append(f"  ⚠️ {len(negatives)} terms wasting ${total_waste:.2f} total")
        for c in negatives[:10]:
            lines.append(f"     ✖ \"{c['search_term']}\" — {c['clicks']} clicks, $0 conv, ${c['cost']:.2f} wasted")

    # Keyword expansion
    if expansions:
        lines.extend(["", "━━━ 6. KEYWORD EXPANSION OPPORTUNITIES ━━━"])
        lines.append(f"  🚀 {len(expansions)} converting terms not yet added as keywords")
        for c in expansions[:10]:
            lines.append(f"     + \"{c['search_term']}\" — {c['conversions']:.0f} conv, ${c['cost_per_conversion']:.2f} CPA, suggested bid ${c['suggested_bid']:.2f}")

    # Bid optimization
    if bid_recs:
        lines.extend(["", "━━━ 7. BID OPTIMIZATION RECOMMENDATIONS ━━━"])
        increases = [r for r in bid_recs if r["action"] == "INCREASE"]
        decreases = [r for r in bid_recs if r["action"] == "DECREASE"]
        pauses = [r for r in bid_recs if r["action"] == "PAUSE"]

        if increases:
            lines.append(f"  ⬆️ {len(increases)} keywords to increase bids:")
            for r in increases[:5]:
                lines.append(f"     \"{r['keyword']}\" ${r['current_bid']:.2f} → ${r['new_bid']:.2f} ({r['change_pct']:+.0f}%)")
        if decreases:
            lines.append(f"  ⬇️ {len(decreases)} keywords to decrease bids:")
            for r in decreases[:5]:
                lines.append(f"     \"{r['keyword']}\" ${r['current_bid']:.2f} → ${r['new_bid']:.2f} ({r['change_pct']:+.0f}%)")
        if pauses:
            lines.append(f"  ⏸️ {len(pauses)} keywords recommended to pause")

    # Agent activity
    if action_counts:
        lines.extend(["", "━━━ 8. AGENT ACTIVITY (Last 7 Days) ━━━"])
        for action_type, count in action_counts.items():
            lines.append(f"  {action_type}: {count}")

    # Budget pacing
    budgets = get_budget_status()
    if budgets:
        lines.extend(["", "━━━ 9. BUDGET PACING ━━━"])
        for b in budgets:
            lines.append(f"  {b['campaign']}: ${b['month_spend']:.2f} / ${b['monthly_budget']:.2f} ({b['month_pct']:.0f}%) — {b['pacing_status']}")

    lines.extend(["", "═" * 55, "End of Weekly Report"])

    report = "\n".join(lines)
    log_report("weekly_deep_dive", report, "LAST_7_DAYS")
    return report


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    from skills.reporting.daily_summary import send_report
    report = generate_weekly_report()
    send_report(report)
