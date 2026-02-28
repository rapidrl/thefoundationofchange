"""
Action Log — SQLite database for tracking all agent actions.
Every change made by the agent is recorded here for audit and rollback.
"""

import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "action_log.db")


def get_conn() -> sqlite3.Connection:
    """Get a connection to the action log database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    _ensure_tables(conn)
    return conn


def _ensure_tables(conn: sqlite3.Connection):
    """Create tables if they don't exist."""
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS actions (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp       TEXT    NOT NULL DEFAULT (datetime('now')),
            action_type     TEXT    NOT NULL,
            target_type     TEXT    NOT NULL,
            target_id       TEXT,
            target_name     TEXT,
            campaign        TEXT,
            ad_group        TEXT,
            old_value       TEXT,
            new_value       TEXT,
            reason          TEXT,
            approved_by     TEXT    DEFAULT 'auto',
            rolled_back     INTEGER DEFAULT 0,
            rollback_of     INTEGER REFERENCES actions(id)
        );

        CREATE TABLE IF NOT EXISTS alerts (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp       TEXT    NOT NULL DEFAULT (datetime('now')),
            level           TEXT    NOT NULL,
            category        TEXT    NOT NULL,
            campaign        TEXT,
            message         TEXT    NOT NULL,
            acknowledged    INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS reports (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp       TEXT    NOT NULL DEFAULT (datetime('now')),
            report_type     TEXT    NOT NULL,
            date_range      TEXT,
            content         TEXT    NOT NULL
        );
    """)


def log_action(
    action_type: str,
    target_type: str,
    target_name: str,
    old_value: str | None = None,
    new_value: str | None = None,
    reason: str = "",
    campaign: str = "",
    ad_group: str = "",
    target_id: str = "",
    approved_by: str = "auto",
) -> int:
    """
    Record an action in the log.

    Args:
        action_type: e.g. 'add_negative', 'adjust_bid', 'pause_ad', 'add_keyword'
        target_type: e.g. 'keyword', 'ad', 'campaign', 'ad_group'
        target_name: The target's name/text
        old_value: Previous value (for rollback)
        new_value: New value
        reason: Why this action was taken
        campaign: Campaign name
        ad_group: Ad group name
        target_id: Google Ads resource ID
        approved_by: 'auto' or 'user'

    Returns:
        Row id of the logged action.
    """
    conn = get_conn()
    cursor = conn.execute(
        """INSERT INTO actions
           (action_type, target_type, target_id, target_name, campaign, ad_group,
            old_value, new_value, reason, approved_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (action_type, target_type, target_id, target_name, campaign, ad_group,
         old_value, new_value, reason, approved_by),
    )
    conn.commit()
    action_id = cursor.lastrowid
    conn.close()
    return action_id


def log_alert(level: str, category: str, message: str, campaign: str = "") -> int:
    """Record an alert."""
    conn = get_conn()
    cursor = conn.execute(
        "INSERT INTO alerts (level, category, campaign, message) VALUES (?, ?, ?, ?)",
        (level, category, campaign, message),
    )
    conn.commit()
    alert_id = cursor.lastrowid
    conn.close()
    return alert_id


def log_report(report_type: str, content: str, date_range: str = "") -> int:
    """Save a generated report."""
    conn = get_conn()
    cursor = conn.execute(
        "INSERT INTO reports (report_type, date_range, content) VALUES (?, ?, ?)",
        (report_type, date_range, content),
    )
    conn.commit()
    report_id = cursor.lastrowid
    conn.close()
    return report_id


def get_recent_actions(limit: int = 50) -> list[dict]:
    """Get recent actions, newest first."""
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM actions ORDER BY timestamp DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_action(action_id: int) -> dict | None:
    """Get a single action by ID."""
    conn = get_conn()
    row = conn.execute("SELECT * FROM actions WHERE id = ?", (action_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def mark_rolled_back(action_id: int, rollback_action_id: int):
    """Mark an action as rolled back."""
    conn = get_conn()
    conn.execute(
        "UPDATE actions SET rolled_back = 1 WHERE id = ?", (action_id,)
    )
    conn.execute(
        "UPDATE actions SET rollback_of = ? WHERE id = ?", (action_id, rollback_action_id)
    )
    conn.commit()
    conn.close()


def get_actions_since(timestamp: str) -> list[dict]:
    """Get all non-rolled-back actions since a timestamp."""
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM actions WHERE timestamp >= ? AND rolled_back = 0 ORDER BY timestamp DESC",
        (timestamp,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_action_summary(days: int = 7) -> dict:
    """Summarize actions over the last N days."""
    conn = get_conn()
    cutoff = (datetime.now() - __import__('datetime').timedelta(days=days)).isoformat()
    rows = conn.execute(
        "SELECT action_type, COUNT(*) as count FROM actions WHERE timestamp >= ? GROUP BY action_type",
        (cutoff,),
    ).fetchall()
    conn.close()
    return {r["action_type"]: r["count"] for r in rows}
