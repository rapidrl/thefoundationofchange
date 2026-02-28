"""Test WP REST API with multiple auth approaches."""
import base64
import os
import requests
from dotenv import load_dotenv

load_dotenv()

WP_USERNAME = os.getenv("WP_USERNAME")
WP_APP_PASSWORD = os.getenv("WP_APP_PASSWORD")
BASE = "https://y8e.62b.myftpupload.com/wp-json"

print(f"=== WordPress REST API Auth Test ===\n")

# Test 1: Check if REST API is accessible at all (no auth)
print("Test 1: GET /wp-json (no auth)")
r = requests.get(BASE, timeout=10)
print(f"  Status: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"  Site: {data.get('name', 'unknown')}")
    print(f"  URL: {data.get('url', 'unknown')}")
    # Check authentication methods
    auth = data.get("authentication", {})
    print(f"  Auth methods: {list(auth.keys())}")
else:
    print(f"  Body: {r.text[:200]}")

# Test 2: Basic auth with Application Password
print("\nTest 2: GET /wp/v2/users/me (Basic Auth)")
r2 = requests.get(
    f"{BASE}/wp/v2/users/me",
    auth=(WP_USERNAME, WP_APP_PASSWORD),
    timeout=10,
)
print(f"  Status: {r2.status_code}")
print(f"  Headers: {dict(r2.headers)}")
print(f"  Body: {r2.text[:300]}")

# Test 3: Explicit Authorization header
print("\nTest 3: GET /wp/v2/users/me (Manual Authorization header)")
creds = base64.b64encode(f"{WP_USERNAME}:{WP_APP_PASSWORD}".encode()).decode()
r3 = requests.get(
    f"{BASE}/wp/v2/users/me",
    headers={"Authorization": f"Basic {creds}"},
    timeout=10,
)
print(f"  Status: {r3.status_code}")
print(f"  Body: {r3.text[:300]}")

# Test 4: Try without spaces in app password
print("\nTest 4: GET /wp/v2/users/me (App password without spaces)")
APP_PASS_NOSPACE = WP_APP_PASSWORD.replace(" ", "")
r4 = requests.get(
    f"{BASE}/wp/v2/users/me",
    auth=(WP_USERNAME, APP_PASS_NOSPACE),
    timeout=10,
)
print(f"  Status: {r4.status_code}")
print(f"  Body: {r4.text[:300]}")

# Test 5: GET categories without auth
print("\nTest 5: GET /wp/v2/categories (no auth)")
r5 = requests.get(f"{BASE}/wp/v2/categories", timeout=10)
print(f"  Status: {r5.status_code}")
print(f"  Body: {r5.text[:300]}")
