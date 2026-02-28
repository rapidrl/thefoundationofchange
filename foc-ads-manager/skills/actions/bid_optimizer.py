"""
Bid Optimization — READ-ONLY / RECOMMENDATION MODE
Analyzes keyword CPAs and recommends bid adjustments.
Does NOT make any changes to Google Ads.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from google_ads_client import get_env_float, get_env_bool, get_env_int
from skills.data_gathering.search_terms import get_keywords


def get_recommendations(target_cpa: float | None = None) -> list[dict]:
    """
    Analyze all keywords and recommend bid adjustments.
    No changes are made — this is purely analytical.

    Logic:
        - If keyword CPA < target → recommend INCREASE bid
        - If keyword CPA > target * 1.5 → recommend DECREASE bid
        - If 50+ clicks and 0 conversions → recommend PAUSE
    """
    if target_cpa is None:
        target_cpa = get_env_float("TARGET_CPA", 25.0)

    ad_grants = get_env_bool("AD_GRANTS_MODE", False)
    max_cpc = get_env_float("AD_GRANTS_MAX_CPC", 2.0) if ad_grants else 50.0

    keywords = get_keywords()
    recommendations = []

    for kw in keywords:
        if kw["clicks"] < 20:
            continue

        current_bid = kw["bid"]
        cpa = kw["cost_per_conversion"]
        conversions = kw["conversions"]

        if conversions == 0 and kw["clicks"] >= 50:
            recommendations.append({
                "keyword": kw["keyword"],
                "match_type": kw["match_type"],
                "campaign": kw["campaign"],
                "ad_group": kw["ad_group"],
                "current_bid": current_bid,
                "clicks": kw["clicks"],
                "conversions": conversions,
                "cpa": cpa,
                "cost": kw["cost"],
                "action": "PAUSE",
                "new_bid": 0,
                "change_pct": -100,
                "reason": f"{kw['clicks']} clicks, 0 conversions — recommend pausing",
                "recommendation": f"Pause keyword \"{kw['keyword']}\" — spending ${kw['cost']:.2f} with no conversions",
                "priority": "HIGH",
            })
            continue

        if conversions < 2:
            continue

        if cpa < target_cpa * 0.7:
            increase_factor = min(1.3, target_cpa / cpa)
            new_bid = round(min(current_bid * increase_factor, max_cpc), 2)
            change_pct = round((new_bid - current_bid) / current_bid * 100, 1) if current_bid > 0 else 0
            recommendations.append({
                "keyword": kw["keyword"],
                "match_type": kw["match_type"],
                "campaign": kw["campaign"],
                "ad_group": kw["ad_group"],
                "current_bid": current_bid,
                "clicks": kw["clicks"],
                "conversions": conversions,
                "cpa": cpa,
                "cost": kw["cost"],
                "action": "INCREASE",
                "new_bid": new_bid,
                "change_pct": change_pct,
                "reason": f"CPA ${cpa:.2f} is {round((1 - cpa/target_cpa) * 100)}% below target ${target_cpa:.2f}",
                "recommendation": f"Increase bid from ${current_bid:.2f} → ${new_bid:.2f} ({change_pct:+.0f}%)",
                "priority": "MEDIUM",
            })
        elif cpa > target_cpa * 1.5:
            decrease_factor = max(0.7, target_cpa / cpa)
            new_bid = round(max(current_bid * decrease_factor, 0.10), 2)
            change_pct = round((new_bid - current_bid) / current_bid * 100, 1) if current_bid > 0 else 0
            recommendations.append({
                "keyword": kw["keyword"],
                "match_type": kw["match_type"],
                "campaign": kw["campaign"],
                "ad_group": kw["ad_group"],
                "current_bid": current_bid,
                "clicks": kw["clicks"],
                "conversions": conversions,
                "cpa": cpa,
                "cost": kw["cost"],
                "action": "DECREASE",
                "new_bid": new_bid,
                "change_pct": change_pct,
                "reason": f"CPA ${cpa:.2f} is {round((cpa/target_cpa - 1) * 100)}% above target ${target_cpa:.2f}",
                "recommendation": f"Decrease bid from ${current_bid:.2f} → ${new_bid:.2f} ({change_pct:+.0f}%)",
                "priority": "HIGH" if cpa > target_cpa * 2 else "MEDIUM",
            })

    return sorted(recommendations, key=lambda x: abs(x.get("change_pct", 0)), reverse=True)


def format_report(recommendations: list[dict] | None = None) -> str:
    """Format bid recommendations as a readable report."""
    if recommendations is None:
        recommendations = get_recommendations()

    if not recommendations:
        return "✅ No bid adjustments recommended — all keywords within CPA targets."

    target_cpa = get_env_float("TARGET_CPA", 25.0)
    increases = [r for r in recommendations if r["action"] == "INCREASE"]
    decreases = [r for r in recommendations if r["action"] == "DECREASE"]
    pauses = [r for r in recommendations if r["action"] == "PAUSE"]

    lines = [
        f"═══ BID OPTIMIZATION RECOMMENDATIONS (Target CPA: ${target_cpa:.2f}) ═══\n",
    ]

    if pauses:
        lines.append(f"⏸️ RECOMMEND PAUSING ({len(pauses)} keywords):")
        for r in pauses:
            lines.append(f"  • \"{r['keyword']}\" — {r['clicks']} clicks, ${r['cost']:.2f} spent, 0 conversions")

    if decreases:
        lines.append(f"\n⬇️ RECOMMEND DECREASING BID ({len(decreases)} keywords):")
        for r in decreases:
            lines.append(f"  • \"{r['keyword']}\" ${r['current_bid']:.2f} → ${r['new_bid']:.2f} ({r['change_pct']:+.0f}%)")
            lines.append(f"    CPA: ${r['cpa']:.2f} — {r['reason']}")

    if increases:
        lines.append(f"\n⬆️ RECOMMEND INCREASING BID ({len(increases)} keywords):")
        for r in increases:
            lines.append(f"  • \"{r['keyword']}\" ${r['current_bid']:.2f} → ${r['new_bid']:.2f} ({r['change_pct']:+.0f}%)")
            lines.append(f"    CPA: ${r['cpa']:.2f} — {r['reason']}")

    return "\n".join(lines)


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    print(format_report())
