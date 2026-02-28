"""
Keyword Expansion — READ-ONLY / RECOMMENDATION MODE
Identifies converting search terms not yet added as keywords.
Does NOT make any changes to Google Ads.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from skills.data_gathering.search_terms import find_expansion_candidates
from google_ads_client import get_env_float, get_env_bool


def get_recommendations() -> list[dict]:
    """
    Get keyword expansion recommendations.
    Returns converting search terms not yet added as keywords, with suggested bids.
    No changes are made — this is purely analytical.
    """
    candidates = find_expansion_candidates()
    ad_grants = get_env_bool("AD_GRANTS_MODE", False)
    max_cpc = get_env_float("AD_GRANTS_MAX_CPC", 2.0) if ad_grants else 50.0

    recommendations = []
    for c in candidates:
        suggested_bid = min(c["suggested_bid"], max_cpc)
        recommendations.append({
            "search_term": c["search_term"],
            "campaign": c["campaign"],
            "ad_group": c["ad_group"],
            "conversions": c["conversions"],
            "cpa": c["cost_per_conversion"],
            "cost": c["cost"],
            "suggested_bid": suggested_bid,
            "suggested_match_type": "EXACT",
            "reason": c["reason"],
            "recommendation": f"Add \"{c['search_term']}\" as an exact match keyword with ${suggested_bid:.2f} bid",
            "priority": "HIGH" if c["conversions"] >= 3 else ("MEDIUM" if c["conversions"] >= 1 else "LOW"),
            "ad_grants_compliant": suggested_bid <= max_cpc if ad_grants else True,
        })
    return recommendations


def format_report(recommendations: list[dict] | None = None) -> str:
    """Format keyword expansion recommendations as a readable report."""
    if recommendations is None:
        recommendations = get_recommendations()

    if not recommendations:
        return "✅ No keyword expansion opportunities — all converting terms are already tracked."

    lines = [
        "═══ KEYWORD EXPANSION RECOMMENDATIONS ═══",
        f"🚀 {len(recommendations)} converting search terms not yet added as keywords\n",
        "Action needed: Add these as keywords in Google Ads\n",
    ]

    for i, r in enumerate(recommendations, 1):
        grant_flag = " ⚠️ EXCEEDS AD GRANTS CPC" if not r["ad_grants_compliant"] else ""
        lines.append(f"  {i}. [{r['priority']}] \"{r['search_term']}\"{grant_flag}")
        lines.append(f"     Campaign: {r['campaign']} → Ad Group: {r['ad_group']}")
        lines.append(f"     {r['conversions']:.0f} conversions at ${r['cpa']:.2f} CPA")
        lines.append(f"     → {r['recommendation']}\n")

    return "\n".join(lines)


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    print(format_report())
