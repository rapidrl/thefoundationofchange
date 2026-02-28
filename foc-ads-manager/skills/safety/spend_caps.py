"""
Spend Caps — Hard limits on daily spend the agent cannot exceed.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from google_ads_client import get_env_float
from skills.data_gathering.budget import get_budget_status
from db import log_alert


def check_caps() -> dict:
    """
    Check all spend caps and return current status.

    Returns dict with:
        - max_daily: configured max daily spend
        - total_today: actual spend today
        - pct_used: percentage of cap used
        - can_increase_bids: whether bid increases are allowed
        - can_add_keywords: whether new keywords can be added
        - status: human-readable status string
    """
    max_daily = get_env_float("MAX_DAILY_SPEND", 50.0)
    budgets = get_budget_status()
    total_today = sum(b["today_spend"] for b in budgets)
    pct_used = round((total_today / max_daily * 100) if max_daily > 0 else 0, 1)

    # Tiered restrictions
    can_increase_bids = pct_used < 90
    can_add_keywords = pct_used < 80

    if pct_used >= 100:
        status = "🛑 CAP EXCEEDED — all increases blocked"
    elif pct_used >= 90:
        status = "⚠️ NEAR CAP — bid increases blocked"
    elif pct_used >= 80:
        status = "⚠️ APPROACHING CAP — new keyword additions blocked"
    else:
        status = "✅ WITHIN CAP"

    return {
        "max_daily": max_daily,
        "total_today": round(total_today, 2),
        "pct_used": pct_used,
        "can_increase_bids": can_increase_bids,
        "can_add_keywords": can_add_keywords,
        "status": status,
    }


def enforce_cap(action_type: str) -> tuple[bool, str]:
    """
    Check if an action is allowed under current spend caps.

    Returns:
        (allowed, reason) tuple.
    """
    caps = check_caps()

    if action_type in ("adjust_bid", "increase_bid") and not caps["can_increase_bids"]:
        msg = f"Bid increase blocked: daily spend at {caps['pct_used']}% of ${caps['max_daily']:.2f} cap"
        log_alert("WARNING", "spend_cap", msg)
        return False, msg

    if action_type == "add_keyword" and not caps["can_add_keywords"]:
        msg = f"Keyword addition blocked: daily spend at {caps['pct_used']}% of ${caps['max_daily']:.2f} cap"
        log_alert("WARNING", "spend_cap", msg)
        return False, msg

    return True, "OK"


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    caps = check_caps()
    print("\n═══ SPEND CAP STATUS ═══")
    for k, v in caps.items():
        print(f"  {k}: {v}")
