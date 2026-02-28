"""
FOC Google Ads Agent — Main Entry Point (READ-ONLY MODE)
Gathers data, analyzes performance, and generates recommendations.
Does NOT make any changes to Google Ads.

Usage:
    python main.py                 # Full analysis cycle
    python main.py --report daily  # Generate daily report only
    python main.py --report weekly # Generate weekly report only
    python main.py --alerts        # Check alerts only
    python main.py --status        # Show account status
    python main.py --schedule      # Run on a schedule (daily/weekly)
    python main.py --recommend     # Show all recommendations
"""

from __future__ import annotations
import sys
import os
import argparse
import schedule
import time
from datetime import datetime

# Ensure project root is on the path
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


READ_ONLY_BANNER = """
╔═══════════════════════════════════════════════════╗
║  🔒 FOC ADS AGENT — READ-ONLY MODE               ║
║  This agent ONLY reads data and gives              ║
║  recommendations. It will NEVER modify your ads.   ║
╚═══════════════════════════════════════════════════╝
"""


def run_analysis_cycle():
    """
    Full analysis cycle (read-only):
    1. Check spending/alerts
    2. Analyze search terms for negative keyword opportunities
    3. Identify keyword expansion opportunities
    4. Analyze bids vs CPA targets
    5. Compare ad copy variants
    6. Generate daily report with all recommendations
    """
    print(READ_ONLY_BANNER)
    print(f"  Analysis started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'═' * 55}\n")

    # 1. Check alerts
    print("Step 1/6: Checking alerts...")
    from skills.reporting.alerts import check_all_alerts
    alerts = check_all_alerts()
    for a in alerts:
        icon = {"CRITICAL": "🔴", "WARNING": "🟡", "INFO": "🔵"}.get(a["level"], "⚪")
        print(f"  {icon} {a['message']}")
    if not alerts:
        print("  ✅ No alerts")

    # 2. Negative keyword recommendations
    print("\nStep 2/6: Analyzing search terms for negatives...")
    from skills.actions.negative_keywords import get_recommendations as get_neg_recs
    neg_recs = get_neg_recs()
    if neg_recs:
        total_waste = sum(r["cost"] for r in neg_recs)
        print(f"  ⚠️ {len(neg_recs)} terms wasting ${total_waste:.2f}")
        for r in neg_recs[:3]:
            print(f"    → \"{r['search_term']}\" — {r['clicks']} clicks, $0 conversions")
    else:
        print("  ✅ No negative keyword recommendations")

    # 3. Keyword expansion recommendations
    print("\nStep 3/6: Finding keyword expansion opportunities...")
    from skills.actions.keyword_expansion import get_recommendations as get_exp_recs
    exp_recs = get_exp_recs()
    if exp_recs:
        print(f"  🚀 {len(exp_recs)} converting terms not yet added")
        for r in exp_recs[:3]:
            print(f"    → \"{r['search_term']}\" — {r['conversions']:.0f} conv, ${r['cpa']:.2f} CPA")
    else:
        print("  ✅ All converting terms are tracked")

    # 4. Bid recommendations
    print("\nStep 4/6: Analyzing bids vs CPA targets...")
    from skills.actions.bid_optimizer import get_recommendations as get_bid_recs
    bid_recs = get_bid_recs()
    if bid_recs:
        increases = len([r for r in bid_recs if r["action"] == "INCREASE"])
        decreases = len([r for r in bid_recs if r["action"] == "DECREASE"])
        pauses = len([r for r in bid_recs if r["action"] == "PAUSE"])
        print(f"  ⬆️ {increases} increase, ⬇️ {decreases} decrease, ⏸️ {pauses} pause")
    else:
        print("  ✅ All bids within target")

    # 5. Ad copy analysis
    print("\nStep 5/6: Analyzing ad copy performance...")
    from skills.actions.ad_copy_tester import get_recommendations as get_ad_recs
    ad_results = get_ad_recs()
    print(f"  🏆 {len(ad_results['winners'])} top performers")
    print(f"  ⚠️ {len(ad_results['losers'])} underperformers")
    print(f"  📊 {len(ad_results['insufficient_data'])} need more data")

    # 6. Daily report
    print("\nStep 6/6: Generating daily report...")
    from skills.reporting.daily_summary import generate_daily_summary, send_report
    report = generate_daily_summary()
    send_report(report)

    print(f"\n{'═' * 55}")
    print("  🔒 Analysis complete — recommendations only, no changes made")
    print(f"{'═' * 55}\n")


def show_recommendations():
    """Show all recommendations in detail."""
    print(READ_ONLY_BANNER)

    from skills.actions.negative_keywords import format_report as neg_report
    from skills.actions.keyword_expansion import format_report as exp_report
    from skills.actions.bid_optimizer import format_report as bid_report
    from skills.actions.ad_copy_tester import format_report as ad_report

    print(neg_report())
    print("\n")
    print(exp_report())
    print("\n")
    print(bid_report())
    print("\n")
    print(ad_report())


def run_daily_report():
    """Generate and send the daily summary report."""
    from skills.reporting.daily_summary import generate_daily_summary, send_report
    report = generate_daily_summary()
    send_report(report)


def run_weekly_report():
    """Generate and send the weekly deep dive report."""
    from skills.reporting.weekly_deep_dive import generate_weekly_report
    from skills.reporting.daily_summary import send_report
    report = generate_weekly_report()
    send_report(report)


def run_alerts():
    """Check all alerts."""
    from skills.reporting.alerts import check_all_alerts
    alerts = check_all_alerts()
    if alerts:
        for a in alerts:
            icon = {"CRITICAL": "🔴", "WARNING": "🟡", "INFO": "🔵", "ERROR": "⚫"}.get(a["level"], "⚪")
            print(f"{icon} [{a['level']}] {a.get('campaign', '')}: {a['message']}")
    else:
        print("✅ No alerts — all clear!")


def show_status():
    """Show account status summary."""
    print(READ_ONLY_BANNER)
    from skills.data_gathering.performance import get_account_summary
    from skills.data_gathering.budget import get_budget_status
    from skills.safety.spend_caps import check_caps

    print("═══ ACCOUNT STATUS (Last 7 Days) ═══")
    summary = get_account_summary("LAST_7_DAYS")
    for k, v in summary.items():
        if k != "campaigns":
            print(f"  {k}: {v}")

    print("\n═══ BUDGET STATUS ═══")
    budgets = get_budget_status()
    for b in budgets:
        print(f"  {b['campaign']}: ${b['today_spend']:.2f} / ${b['daily_budget']:.2f} — {b['pacing_status']}")

    print("\n═══ SPEND CAP ═══")
    caps = check_caps()
    print(f"  {caps['status']}")


def run_scheduled():
    """Run the agent on a schedule (read-only)."""
    print(READ_ONLY_BANNER)
    print("🕐 FOC Ads Agent — Scheduled Mode (READ-ONLY)")
    print("   Daily analysis: 8:00 AM")
    print("   Daily report: 6:00 PM")
    print("   Weekly report: Monday 9:00 AM")
    print("   Alert checks: Every 2 hours")
    print("   Press Ctrl+C to stop\n")

    schedule.every().day.at("08:00").do(run_analysis_cycle)
    schedule.every().day.at("18:00").do(run_daily_report)
    schedule.every().monday.at("09:00").do(run_weekly_report)
    schedule.every(2).hours.do(run_alerts)

    # Run immediately on start
    run_alerts()

    while True:
        schedule.run_pending()
        time.sleep(60)


def main():
    parser = argparse.ArgumentParser(
        description="FOC Google Ads Agent (READ-ONLY — recommendations only, no changes)")
    parser.add_argument("--schedule", action="store_true", help="Run on a schedule")
    parser.add_argument("--report", choices=["daily", "weekly"], help="Generate a report")
    parser.add_argument("--alerts", action="store_true", help="Check alerts")
    parser.add_argument("--status", action="store_true", help="Show account status")
    parser.add_argument("--recommend", action="store_true", help="Show all recommendations")

    args = parser.parse_args()

    if args.schedule:
        run_scheduled()
    elif args.report == "daily":
        run_daily_report()
    elif args.report == "weekly":
        run_weekly_report()
    elif args.alerts:
        run_alerts()
    elif args.status:
        show_status()
    elif args.recommend:
        show_recommendations()
    else:
        run_analysis_cycle()


if __name__ == "__main__":
    main()
