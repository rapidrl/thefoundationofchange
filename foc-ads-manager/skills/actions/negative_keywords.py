"""
Negative Keyword Management — READ-ONLY / RECOMMENDATION MODE
Identifies wasteful search terms and recommends them for negative keywords.
Does NOT make any changes to Google Ads.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from skills.data_gathering.search_terms import find_negative_candidates


def get_recommendations() -> list[dict]:
    """
    Get negative keyword recommendations.
    Returns a list of search terms wasting budget, with reasoning.
    No changes are made — this is purely analytical.
    """
    candidates = find_negative_candidates()
    recommendations = []
    for c in candidates:
        recommendations.append({
            "search_term": c["search_term"],
            "campaign": c["campaign"],
            "ad_group": c["ad_group"],
            "clicks": c["clicks"],
            "impressions": c["impressions"],
            "cost": c["cost"],
            "conversions": c["conversions"],
            "reason": c["reason"],
            "recommendation": f"Add \"{c['search_term']}\" as a negative keyword in campaign \"{c['campaign']}\"",
            "priority": "HIGH" if c["cost"] > 20 else ("MEDIUM" if c["cost"] > 5 else "LOW"),
        })
    return recommendations


def format_report(recommendations: list[dict] | None = None) -> str:
    """Format negative keyword recommendations as a readable report."""
    if recommendations is None:
        recommendations = get_recommendations()

    if not recommendations:
        return "✅ No negative keyword recommendations — all search terms are performing acceptably."

    total_waste = sum(r["cost"] for r in recommendations)
    lines = [
        "═══ NEGATIVE KEYWORD RECOMMENDATIONS ═══",
        f"⚠️ {len(recommendations)} search terms wasting ${total_waste:.2f} total\n",
        "Action needed: Add these as negative keywords in Google Ads\n",
    ]

    for i, r in enumerate(recommendations, 1):
        lines.append(f"  {i}. [{r['priority']}] \"{r['search_term']}\"")
        lines.append(f"     Campaign: {r['campaign']}")
        lines.append(f"     {r['clicks']} clicks, ${r['cost']:.2f} spent, 0 conversions")
        lines.append(f"     → {r['recommendation']}\n")

    return "\n".join(lines)


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    print(format_report())
