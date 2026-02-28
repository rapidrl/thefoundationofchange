"""Check Supabase table constraints for hour_logs."""
import requests
import json

SUPABASE_URL = "https://zdedpccqcufnqhwueysr.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZWRwY2NxY3VmbnFod3VleXNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwNTI4NSwiZXhwIjoyMDg3MzgxMjg1fQ.Sa6f0PIYASbmmY5fe38_pIytJVdUNBysst1n-vVl8As"

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}

# Query the database schema for hour_logs table
r = requests.get(
    f"{SUPABASE_URL}/rest/v1/",
    headers={**headers, "Accept": "application/openapi+json"},
)
if r.status_code == 200:
    schema = r.json()
    if "definitions" in schema and "hour_logs" in schema["definitions"]:
        print("--- hour_logs TABLE SCHEMA ---")
        print(json.dumps(schema["definitions"]["hour_logs"], indent=2))
    else:
        print("Could not find hour_logs in schema definitions")
        print(f"Available tables: {list(schema.get('definitions', {}).keys())}")

# Also try SQL query via RPC to check constraints
print("\n--- Checking via SQL RPC ---")

# Try to check the unique constraints
sql_query = """
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'hour_logs'
ORDER BY tc.constraint_name, kcu.ordinal_position;
"""

r2 = requests.post(
    f"{SUPABASE_URL}/rest/v1/rpc/exec_sql",
    headers=headers,
    json={"query": sql_query},
)
print(f"SQL query status: {r2.status_code}")
if r2.status_code == 200:
    print(json.dumps(r2.json(), indent=2))
else:
    print(f"Response: {r2.text[:500]}")

# Try a different hour_logs entry to compare - query all hour logs
print("\n--- ALL HOUR LOGS (last 10) ---")
r3 = requests.get(
    f"{SUPABASE_URL}/rest/v1/hour_logs?select=*&order=created_at.desc&limit=10",
    headers=headers,
)
if r3.status_code == 200:
    for log in r3.json():
        h = log.get("hours", "?")
        m = log.get("minutes", "?")
        print(f"  enrollment={log['enrollment_id'][:8]}... | date={log.get('log_date')} | hours={h} | minutes={m} | created={log.get('created_at')}")

# Also check: does the hours column have a DEFAULT 0?
print("\n--- CHECK COLUMN DEFAULTS ---")
r4 = requests.get(
    f"{SUPABASE_URL}/rest/v1/?apikey={SERVICE_KEY}",
    headers={**headers, "Accept": "application/openapi+json"},
)
