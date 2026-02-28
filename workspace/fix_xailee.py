"""Sync Xailee's hour_log using update endpoint."""
import requests

SUPABASE_URL = "https://zdedpccqcufnqhwueysr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZWRwY2NxY3VmbnFod3VleXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwNTI4NSwiZXhwIjoyMDg3MzgxMjg1fQ.Sa6f0PIYASbmmY5fe38_pIytJVdUNBysst1n-vVl8As"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

log_id = "7de986e8-da63-4d37-b3f0-a4ea0f77b6bc"

# Update hours to match enrollment (1.45h = 87min)
r = requests.patch(
    f"{SUPABASE_URL}/rest/v1/hour_logs?id=eq.{log_id}",
    headers=headers,
    json={"hours": 1.45, "minutes": 87},
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")

# Verify
r2 = requests.get(
    f"{SUPABASE_URL}/rest/v1/hour_logs?id=eq.{log_id}&select=hours,minutes",
    headers=headers,
)
print(f"Verify: {r2.json()}")
