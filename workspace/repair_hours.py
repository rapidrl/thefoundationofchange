"""Fix Xailee and all other records to use hours:minutes format."""
import requests

SUPABASE_URL = "https://zdedpccqcufnqhwueysr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZWRwY2NxY3VmbnFod3VleXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwNTI4NSwiZXhwIjoyMDg3MzgxMjg1fQ.Sa6f0PIYASbmmY5fe38_pIytJVdUNBysst1n-vVl8As"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

# Get ALL hour logs
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/hour_logs?select=id,enrollment_id,log_date,hours,minutes",
    headers=headers,
)
all_logs = r.json()

# Also get all enrollments for cross-reference 
r_enr = requests.get(
    f"{SUPABASE_URL}/rest/v1/enrollments?select=id,hours_completed",
    headers=headers,
)
enrollments = {e["id"]: e["hours_completed"] for e in r_enr.json()}

print(f"Total hour_log records: {len(all_logs)}\n")

# For each enrollment, sum up hour_logs and compare with enrollment.hours_completed
from collections import defaultdict
enroll_logs = defaultdict(list)
for log in all_logs:
    enroll_logs[log["enrollment_id"]].append(log)

fixed = 0
for enrollment_id, logs in enroll_logs.items():
    enrollment_hours = enrollments.get(enrollment_id, None)
    if enrollment_hours is None:
        continue
    
    # If there's only 1 log entry, it should match the enrollment total
    if len(logs) == 1:
        log = logs[0]
        # Convert enrollment hours to hours:minutes format
        total_mins = round(enrollment_hours * 60)
        correct_hours = total_mins // 60
        correct_minutes = total_mins % 60
        
        current_total = log["hours"] + log["minutes"] / 60
        if abs(current_total - enrollment_hours) > 0.05:
            print(f"  FIX: {log['id'][:8]}... | enrollment={enrollment_hours}h | was hours={log['hours']},min={log['minutes']} -> hours={correct_hours},min={correct_minutes}")
            r2 = requests.patch(
                f"{SUPABASE_URL}/rest/v1/hour_logs?id=eq.{log['id']}",
                headers=headers,
                json={"hours": correct_hours, "minutes": correct_minutes},
            )
            if r2.status_code in (200, 204):
                fixed += 1
            else:
                print(f"    Error: {r2.status_code} {r2.text[:200]}")
    else:
        # Multiple log entries - each one already has reasonable data, just ensure format
        for log in logs:
            h = log["hours"]
            m = log["minutes"]
            # Check if minutes > 59 (old format: total minutes)
            if m > 59:
                correct_hours = int(h) + m // 60
                correct_minutes = m % 60
                print(f"  FORMAT FIX: {log['id'][:8]}... | was hours={h},min={m} -> hours={correct_hours},min={correct_minutes}")
                r2 = requests.patch(
                    f"{SUPABASE_URL}/rest/v1/hour_logs?id=eq.{log['id']}",
                    headers=headers,
                    json={"hours": correct_hours, "minutes": correct_minutes},
                )
                if r2.status_code in (200, 204):
                    fixed += 1

print(f"\nFixed {fixed} records")

# Verify Xailee
print("\n--- VERIFY: Xailee Carreon ---")
r3 = requests.get(
    f"{SUPABASE_URL}/rest/v1/hour_logs?enrollment_id=eq.ef8e3d1b-0600-4233-82fb-12fff3a8b5ea&select=*",
    headers=headers,
)
for log in r3.json():
    print(f"  hours={log['hours']} | minutes={log['minutes']}")
    total = log["hours"] + log["minutes"] / 60
    print(f"  Total: {total:.2f}h (enrollment says 1.45h)")
