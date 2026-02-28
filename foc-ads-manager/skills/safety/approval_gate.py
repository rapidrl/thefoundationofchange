"""
Approval Gate — Controls which actions can auto-execute vs. need user confirmation.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from google_ads_client import get_env_bool, get_env_int, get_env_float


# ─── Action Classification ──────────────────────────────────

# Actions that ALWAYS require approval
MAJOR_ACTIONS = {
    "pause_campaign",
    "pause_ad_group",
    "enable_campaign",
    "remove_keyword",
    "increase_budget",
    "change_bidding_strategy",
}

# Actions that can auto-approve under certain conditions
MINOR_ACTIONS = {
    "add_negative",
    "adjust_bid",
    "add_keyword",
    "pause_ad",
}


def needs_approval(action_type: str, change_pct: float = 0, bid_amount: float = 0) -> bool:
    """
    Determine if an action needs user approval.

    Rules:
        1. If APPROVAL_REQUIRED=true (global), everything needs approval
        2. Major actions (pause campaign, increase budget) ALWAYS need approval
        3. Bid changes > AUTO_APPROVE_BID_CHANGE_PCT need approval
        4. In Ad Grants mode, bids above MAX_CPC need approval
        5. Everything else auto-approves

    Returns:
        True if the action needs user approval before execution.
    """
    # Global override
    if get_env_bool("APPROVAL_REQUIRED", True):
        return True

    # Major actions always need approval
    if action_type in MAJOR_ACTIONS:
        return True

    # Check bid change threshold
    if action_type == "adjust_bid":
        max_auto_pct = get_env_int("AUTO_APPROVE_BID_CHANGE_PCT", 10)
        if abs(change_pct) > max_auto_pct:
            return True

    # Ad Grants CPC cap
    if get_env_bool("AD_GRANTS_MODE", False):
        max_cpc = get_env_float("AD_GRANTS_MAX_CPC", 2.0)
        if bid_amount > max_cpc:
            return True

    return False


def format_approval_request(action: dict) -> str:
    """Format an action into a human-readable approval request."""
    lines = [
        "🔔 ACTION REQUIRES APPROVAL",
        f"  Type: {action.get('action_type', action.get('action', 'unknown'))}",
        f"  Target: {action.get('target_name', action.get('keyword', 'unknown'))}",
    ]

    if action.get("campaign"):
        lines.append(f"  Campaign: {action['campaign']}")
    if action.get("ad_group"):
        lines.append(f"  Ad Group: {action['ad_group']}")
    if action.get("old_value") or action.get("current_bid"):
        old = action.get("old_value") or f"${action.get('current_bid', 0):.2f}"
        lines.append(f"  Current: {old}")
    if action.get("new_value") or action.get("new_bid"):
        new = action.get("new_value") or f"${action.get('new_bid', 0):.2f}"
        lines.append(f"  Proposed: {new}")
    if action.get("change_pct"):
        lines.append(f"  Change: {action['change_pct']:+.1f}%")
    if action.get("reason"):
        lines.append(f"  Reason: {action['reason']}")

    lines.append("\n  Reply APPROVE or REJECT")
    return "\n".join(lines)
