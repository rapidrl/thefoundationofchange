"""
Real-Time Alerts
Monitor for anomalies: CPA spikes, budget exhaustion, campaign errors, disapproved ads.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from google_ads_client import get_client, get_customer_id, run_query, get_env_float, get_env_bool
from skills.data_gathering.performance import get_account_summary
from skills.data_gathering.budget import get_budget_alerts, check_spend_cap
from db import log_alert


# ─── GAQL for disapproved ads ───────────────────────────────

DISAPPROVED_ADS_QUERY = """
    SELECT
        campaign.name,
        ad_group.name,
        ad_group_ad.ad.id,
        ad_group_ad.policy_summary.approval_status,
        ad_group_ad.policy_summary.policy_topic_entries
    FROM ad_group_ad
    WHERE ad_group_ad.policy_summary.approval_status IN ('DISAPPROVED', 'AREA_OF_INTEREST_ONLY')
"""

CAMPAIGN_ERRORS_QUERY = """
    SELECT
        campaign.name,
        campaign.status,
        campaign.serving_status
    FROM campaign
    WHERE campaign.serving_status != 'SERVING'
        AND campaign.status = 'ENABLED'
"""


def check_all_alerts() -> list[dict]:
    """
    Run all alert checks and return a list of triggered alerts.
    Each alert has: level, category, campaign, message.
    """
    alerts = []

    # 1. Budget alerts
    alerts.extend(get_budget_alerts())

    # 2. CPA spike detection
    alerts.extend(_check_cpa_spikes())

    # 3. Disapproved ads
    alerts.extend(_check_disapproved_ads())

    # 4. Campaign serving errors
    alerts.extend(_check_campaign_errors())

    # 5. Ad Grants CTR warning
    if get_env_bool("AD_GRANTS_MODE", False):
        alerts.extend(_check_ad_grants_ctr())

    # Log all alerts
    for a in alerts:
        log_alert(a["level"], a["category"], a["message"], a.get("campaign", ""))

    return alerts


def _check_cpa_spikes() -> list[dict]:
    """Check if CPA has spiked above target."""
    alerts = []
    target_cpa = get_env_float("TARGET_CPA", 25.0)

    try:
        summary = get_account_summary("LAST_7_DAYS")
        cpa = summary["overall_cpa"]

        if cpa > target_cpa * 2:
            alerts.append({
                "level": "CRITICAL",
                "category": "cpa_spike",
                "campaign": "ALL",
                "message": f"CPA at ${cpa:.2f} — 2x above target ${target_cpa:.2f}! Immediate review needed.",
            })
        elif cpa > target_cpa * 1.5:
            alerts.append({
                "level": "WARNING",
                "category": "cpa_spike",
                "campaign": "ALL",
                "message": f"CPA at ${cpa:.2f} — 50% above target ${target_cpa:.2f}.",
            })

        # Check per-campaign spikes
        for camp in summary.get("campaigns", []):
            if camp["conversions"] > 0 and camp["cpa"] > target_cpa * 2:
                alerts.append({
                    "level": "WARNING",
                    "category": "cpa_spike",
                    "campaign": camp["campaign"],
                    "message": f"Campaign CPA at ${camp['cpa']:.2f} — review keywords and bids.",
                })
    except Exception as e:
        alerts.append({
            "level": "ERROR",
            "category": "system",
            "message": f"Failed to check CPA: {e}",
        })

    return alerts


def _check_disapproved_ads() -> list[dict]:
    """Check for disapproved ads."""
    alerts = []
    try:
        client = get_client()
        customer_id = get_customer_id()
        rows = run_query(client, customer_id, DISAPPROVED_ADS_QUERY)

        for row in rows:
            alerts.append({
                "level": "WARNING",
                "category": "disapproved_ad",
                "campaign": row.campaign.name,
                "message": f"Ad {row.ad_group_ad.ad.id} in '{row.ad_group.name}' is {row.ad_group_ad.policy_summary.approval_status.name}",
            })
    except Exception:
        pass  # Don't error on alert checks

    return alerts


def _check_campaign_errors() -> list[dict]:
    """Check for campaigns not serving."""
    alerts = []
    try:
        client = get_client()
        customer_id = get_customer_id()
        rows = run_query(client, customer_id, CAMPAIGN_ERRORS_QUERY)

        for row in rows:
            alerts.append({
                "level": "WARNING",
                "category": "campaign_error",
                "campaign": row.campaign.name,
                "message": f"Campaign '{row.campaign.name}' is ENABLED but serving status is {row.campaign.serving_status.name}",
            })
    except Exception:
        pass

    return alerts


def _check_ad_grants_ctr() -> list[dict]:
    """Check account CTR for Google Ad Grants compliance (must stay above 5%)."""
    alerts = []
    min_ctr = get_env_float("AD_GRANTS_MIN_CTR", 5.0)

    try:
        summary = get_account_summary("LAST_30_DAYS")
        ctr = summary["overall_ctr"]

        if ctr < min_ctr:
            alerts.append({
                "level": "CRITICAL",
                "category": "ad_grants",
                "campaign": "ALL",
                "message": f"Account CTR at {ctr}% — BELOW {min_ctr}% Ad Grants minimum! Risk of account suspension.",
            })
        elif ctr < min_ctr + 1:
            alerts.append({
                "level": "WARNING",
                "category": "ad_grants",
                "campaign": "ALL",
                "message": f"Account CTR at {ctr}% — approaching {min_ctr}% Ad Grants minimum. Consider pausing low-CTR keywords.",
            })
    except Exception:
        pass

    return alerts


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n═══ ALERT CHECK ═══")
    alerts = check_all_alerts()
    if alerts:
        for a in alerts:
            icon = {"CRITICAL": "🔴", "WARNING": "🟡", "INFO": "🔵", "ERROR": "⚫"}.get(a["level"], "⚪")
            print(f"  {icon} [{a['level']}] {a.get('campaign', '')}: {a['message']}")
    else:
        print("  ✅ No alerts — all clear!")
