"""
Google Ad Grants Compliance
Rules and checks for maintaining compliance with Google Ad Grants program.

As a 501(c)(3), FOC may qualify for $10,000/month in free Google Ads.
Key requirements:
    - Maintain 5% minimum account-level CTR
    - $2.00 max CPC (unless using Maximize Conversions)
    - No single-word keywords (except branded)
    - No overly generic keywords
    - Must have valid conversion tracking
    - Geographic targeting required
    - At least 2 ad groups per campaign
    - At least 2 ads per ad group
    - Must actively manage the account monthly
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from google_ads_client import get_env_float, get_env_bool


MAX_CPC = 2.00
MIN_CTR = 5.0
MIN_AD_GROUPS_PER_CAMPAIGN = 2
MIN_ADS_PER_AD_GROUP = 2


def get_compliance_rules() -> dict:
    """Return all Ad Grants compliance rules."""
    return {
        "max_cpc": MAX_CPC,
        "min_ctr_percent": MIN_CTR,
        "min_ad_groups_per_campaign": MIN_AD_GROUPS_PER_CAMPAIGN,
        "min_ads_per_ad_group": MIN_ADS_PER_AD_GROUP,
        "single_word_keywords_allowed": False,
        "must_have_conversion_tracking": True,
        "must_have_geo_targeting": True,
        "monthly_management_required": True,
        "smart_bidding_exempt_from_cpc_cap": True,
    }


def check_keyword_compliance(keyword: str, bid: float, match_type: str = "EXACT") -> dict:
    """
    Check if a keyword meets Ad Grants requirements.

    Returns:
        dict with 'compliant' (bool) and 'issues' (list of strings).
    """
    if not get_env_bool("AD_GRANTS_MODE", False):
        return {"compliant": True, "issues": []}

    issues = []
    max_cpc = get_env_float("AD_GRANTS_MAX_CPC", MAX_CPC)

    # CPC cap check
    if bid > max_cpc:
        issues.append(f"Bid ${bid:.2f} exceeds Ad Grants max CPC ${max_cpc:.2f}")

    # Single-word keyword check
    words = keyword.strip().split()
    if len(words) == 1 and match_type != "EXACT":
        issues.append(f"Single-word keyword '{keyword}' not allowed in Ad Grants (except exact match branded)")

    # Overly generic check
    generic_terms = {"free", "download", "ebook", "news", "today", "best", "help", "stuff"}
    if keyword.lower() in generic_terms:
        issues.append(f"Keyword '{keyword}' is too generic for Ad Grants")

    return {"compliant": len(issues) == 0, "issues": issues}


def check_ctr_compliance(account_ctr: float) -> dict:
    """
    Check if account CTR meets Ad Grants minimum.

    Returns dict with status and recommendation.
    """
    min_ctr = get_env_float("AD_GRANTS_MIN_CTR", MIN_CTR)

    if account_ctr >= min_ctr + 2:
        return {"status": "SAFE", "message": f"CTR {account_ctr:.1f}% — well above {min_ctr}% minimum"}
    elif account_ctr >= min_ctr:
        return {"status": "WARNING", "message": f"CTR {account_ctr:.1f}% — close to {min_ctr}% minimum, consider pausing low-CTR keywords"}
    else:
        return {"status": "CRITICAL", "message": f"CTR {account_ctr:.1f}% — BELOW {min_ctr}% minimum! Pause all keywords below 2% CTR immediately"}


# Ad scheduling recommendations for community service audience
AD_SCHEDULE = {
    "weekday": {
        "peak_hours": [(17, 21)],     # 5pm-9pm (after work/school)
        "moderate_hours": [(12, 14)],  # Lunch break
        "bid_modifier_peak": 1.2,
        "bid_modifier_moderate": 1.0,
        "bid_modifier_off": 0.8,
    },
    "weekend": {
        "peak_hours": [(10, 18)],     # Most of the day
        "bid_modifier_peak": 1.3,
        "bid_modifier_off": 0.9,
    },
}


def get_ad_schedule() -> dict:
    """Return the recommended ad schedule."""
    return AD_SCHEDULE
