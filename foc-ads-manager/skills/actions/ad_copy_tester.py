"""
Ad Copy Testing — READ-ONLY / RECOMMENDATION MODE
Analyzes ad variant performance and recommends winners/losers.
Does NOT make any changes to Google Ads.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from skills.data_gathering.performance import get_ad_performance


MIN_IMPRESSIONS = 200


def get_recommendations(date_range: str = "LAST_30_DAYS") -> dict:
    """
    Analyze ad variants and recommend which to keep and which to pause.
    No changes are made — this is purely analytical.
    """
    ads = get_ad_performance(date_range)

    by_group: dict[str, list[dict]] = {}
    for ad in ads:
        key = f"{ad['campaign']} / {ad['ad_group']}"
        by_group.setdefault(key, []).append(ad)

    winners = []
    losers = []
    insufficient = []

    for group_key, group_ads in by_group.items():
        if len(group_ads) < 2:
            continue

        testable = [a for a in group_ads if a["impressions"] >= MIN_IMPRESSIONS]
        not_ready = [a for a in group_ads if a["impressions"] < MIN_IMPRESSIONS]

        for a in not_ready:
            insufficient.append({**a, "group": group_key,
                "note": f"Only {a['impressions']} impressions (need {MIN_IMPRESSIONS})"})

        if len(testable) < 2:
            continue

        avg_ctr = sum(a["ctr"] for a in testable) / len(testable)

        for ad in testable:
            ctr_vs_avg = ((ad["ctr"] - avg_ctr) / avg_ctr * 100) if avg_ctr > 0 else 0
            conv_rate = (ad["conversions"] / ad["clicks"] * 100) if ad["clicks"] > 0 else 0

            ad_info = {**ad, "group": group_key, "conversion_rate": round(conv_rate, 2),
                       "ctr_vs_avg": round(ctr_vs_avg, 1)}

            if ctr_vs_avg < -30:
                headlines = ", ".join(ad.get("headlines", [])[:3])
                ad_info["reason"] = f"CTR {ad['ctr']:.1f}% is {abs(ctr_vs_avg):.0f}% below average {avg_ctr:.1f}%"
                ad_info["recommendation"] = f"Consider pausing this ad in \"{ad['ad_group']}\""
                losers.append(ad_info)
            elif ctr_vs_avg > 20:
                ad_info["reason"] = f"CTR {ad['ctr']:.1f}% is {ctr_vs_avg:.0f}% above average {avg_ctr:.1f}%"
                ad_info["recommendation"] = "Top performer — keep running"
                winners.append(ad_info)

    return {
        "winners": sorted(winners, key=lambda x: x["ctr_vs_avg"], reverse=True),
        "losers": sorted(losers, key=lambda x: x["ctr_vs_avg"]),
        "insufficient_data": insufficient,
    }


def format_report(results: dict | None = None) -> str:
    """Format ad copy test results as a readable report."""
    if results is None:
        results = get_recommendations()

    lines = ["═══ AD COPY PERFORMANCE ANALYSIS ═══\n"]

    if results["winners"]:
        lines.append(f"🏆 TOP PERFORMING ADS ({len(results['winners'])}):")
        for w in results["winners"][:5]:
            headlines = ", ".join(w.get("headlines", [])[:3])
            lines.append(f"  • [{w['group']}] CTR: {w['ctr']:.1f}% (+{w['ctr_vs_avg']:.0f}% vs avg)")
            lines.append(f"    Headlines: {headlines}")
            lines.append(f"    {w['impressions']} impr, {w['conversions']:.0f} conv — {w['recommendation']}\n")

    if results["losers"]:
        lines.append(f"⚠️ UNDERPERFORMING ADS ({len(results['losers'])}):")
        for l in results["losers"][:5]:
            headlines = ", ".join(l.get("headlines", [])[:3])
            lines.append(f"  • [{l['group']}] CTR: {l['ctr']:.1f}% ({l['ctr_vs_avg']:.0f}% vs avg)")
            lines.append(f"    Headlines: {headlines}")
            lines.append(f"    → {l['recommendation']}\n")

    if results["insufficient_data"]:
        lines.append(f"📊 {len(results['insufficient_data'])} ads need more impressions before analysis\n")

    if not results["winners"] and not results["losers"]:
        lines.append("✅ No significant performance differences between ad variants.\n")

    return "\n".join(lines)


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    print(format_report())
