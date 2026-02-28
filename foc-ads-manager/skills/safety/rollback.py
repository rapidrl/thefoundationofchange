"""
Rollback — Reverse any action the agent has taken.
Uses the action log to restore previous values.
"""

from __future__ import annotations
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from google_ads_client import get_client, get_customer_id
from db import get_action, get_actions_since, log_action, mark_rolled_back


def rollback_action(action_id: int) -> dict:
    """
    Reverse a single action by its ID.

    Reads the action log to find the old value and applies it.
    Creates a new log entry for the rollback.

    Returns:
        dict with status and details.
    """
    action = get_action(action_id)
    if not action:
        return {"status": "error", "error": f"Action {action_id} not found"}

    if action["rolled_back"]:
        return {"status": "error", "error": f"Action {action_id} already rolled back"}

    action_type = action["action_type"]
    result = {"status": "pending", "original_action": action}

    try:
        if action_type == "adjust_bid":
            result = _rollback_bid(action)
        elif action_type == "add_negative":
            result = _rollback_negative(action)
        elif action_type == "add_keyword":
            result = _rollback_keyword(action)
        elif action_type == "pause_ad":
            result = _rollback_pause_ad(action)
        else:
            return {"status": "error", "error": f"Rollback not supported for action type '{action_type}'"}

        if result["status"] == "success":
            # Log the rollback action
            rollback_id = log_action(
                action_type=f"rollback_{action_type}",
                target_type=action["target_type"],
                target_name=action["target_name"],
                target_id=action.get("target_id", ""),
                old_value=action["new_value"],
                new_value=action["old_value"],
                reason=f"Rolling back action #{action_id}",
                campaign=action.get("campaign", ""),
                ad_group=action.get("ad_group", ""),
                approved_by="user",
            )
            mark_rolled_back(action_id, rollback_id)
            result["rollback_action_id"] = rollback_id

    except Exception as e:
        result = {"status": "error", "error": str(e)}

    return result


def rollback_since(timestamp: str) -> list[dict]:
    """
    Reverse all actions since a given timestamp (newest first).

    Args:
        timestamp: ISO format timestamp string

    Returns:
        List of rollback results.
    """
    actions = get_actions_since(timestamp)
    results = []
    for action in actions:
        result = rollback_action(action["id"])
        results.append({"action_id": action["id"], **result})
    return results


# ─── Rollback implementations ───────────────────────────────

def _rollback_bid(action: dict) -> dict:
    """Reverse a bid adjustment."""
    client = get_client()
    customer_id = get_customer_id()
    resource_name = action.get("target_id")

    if not resource_name:
        return {"status": "error", "error": "No resource name stored for bid rollback"}

    # Parse the old bid from the stored value (e.g., "$1.50")
    old_bid_str = action.get("old_value", "0")
    old_bid = float(old_bid_str.replace("$", ""))
    old_bid_micros = int(old_bid * 1_000_000)

    operation = client.get_type("AdGroupCriterionOperation")
    criterion = operation.update
    criterion.resource_name = resource_name
    criterion.cpc_bid_micros = old_bid_micros

    client.copy_from(
        operation.update_mask,
        __import__('google.protobuf.field_mask_pb2', fromlist=['FieldMask']).FieldMask(paths=["cpc_bid_micros"]),
    )

    service = client.get_service("AdGroupCriterionService")
    service.mutate_ad_group_criteria(customer_id=customer_id, operations=[operation])
    return {"status": "success", "restored_bid": old_bid}


def _rollback_negative(action: dict) -> dict:
    """Remove a negative keyword that was added."""
    client = get_client()
    customer_id = get_customer_id()
    resource_name = action.get("new_value")  # Resource name stored in new_value

    if not resource_name:
        return {"status": "error", "error": "No resource name stored for negative rollback"}

    operation = client.get_type("CampaignCriterionOperation")
    operation.remove = resource_name

    service = client.get_service("CampaignCriterionService")
    service.mutate_campaign_criteria(customer_id=customer_id, operations=[operation])
    return {"status": "success", "removed": resource_name}


def _rollback_keyword(action: dict) -> dict:
    """Remove a keyword that was added."""
    client = get_client()
    customer_id = get_customer_id()
    resource_name = action.get("target_id")

    if not resource_name:
        return {"status": "error", "error": "No resource name stored for keyword rollback"}

    operation = client.get_type("AdGroupCriterionOperation")
    operation.remove = resource_name

    service = client.get_service("AdGroupCriterionService")
    service.mutate_ad_group_criteria(customer_id=customer_id, operations=[operation])
    return {"status": "success", "removed": resource_name}


def _rollback_pause_ad(action: dict) -> dict:
    """Re-enable a paused ad."""
    client = get_client()
    customer_id = get_customer_id()
    resource_name = action.get("target_id")

    if not resource_name:
        return {"status": "error", "error": "No resource name stored for ad rollback"}

    operation = client.get_type("AdGroupAdOperation")
    ad = operation.update
    ad.resource_name = resource_name
    ad.status = client.enums.AdGroupAdStatusEnum.ENABLED

    client.copy_from(
        operation.update_mask,
        __import__('google.protobuf.field_mask_pb2', fromlist=['FieldMask']).FieldMask(paths=["status"]),
    )

    service = client.get_service("AdGroupAdService")
    service.mutate_ad_group_ads(customer_id=customer_id, operations=[operation])
    return {"status": "success", "re_enabled": resource_name}


# ─── CLI ─────────────────────────────────────────────────────

if __name__ == "__main__":
    from db import get_recent_actions
    from tabulate import tabulate

    print("\n═══ RECENT ACTIONS (available for rollback) ═══")
    actions = get_recent_actions(20)
    if actions:
        display = [{
            "id": a["id"],
            "time": a["timestamp"],
            "type": a["action_type"],
            "target": a["target_name"],
            "change": f"{a.get('old_value', '')} → {a.get('new_value', '')}",
            "rolled_back": "✅" if a["rolled_back"] else "",
        } for a in actions]
        print(tabulate(display, headers="keys"))
    else:
        print("  No actions recorded yet")
