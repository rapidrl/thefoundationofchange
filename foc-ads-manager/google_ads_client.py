"""
FOC Google Ads Agent — Shared API Client
Handles authentication, GAQL queries, and common API operations.
"""

import os
from dotenv import load_dotenv
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

load_dotenv()


def get_config() -> dict:
    """Load Google Ads API configuration from environment variables."""
    return {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN"),
        "login_customer_id": os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
        "use_proto_plus": True,
    }


def get_customer_id() -> str:
    """Return the customer ID (no dashes)."""
    return os.getenv("GOOGLE_ADS_CUSTOMER_ID", "").replace("-", "")


def get_client() -> GoogleAdsClient:
    """Create an authenticated GoogleAdsClient instance."""
    config = get_config()

    # Check for required credentials
    missing = []
    if not config.get("developer_token"):
        missing.append("GOOGLE_ADS_DEVELOPER_TOKEN")
    if not config.get("client_id"):
        missing.append("GOOGLE_ADS_CLIENT_ID")
    if not config.get("client_secret"):
        missing.append("GOOGLE_ADS_CLIENT_SECRET")
    if not config.get("refresh_token"):
        missing.append("GOOGLE_ADS_REFRESH_TOKEN")

    if missing:
        print("\n╔══════════════════════════════════════════════════╗")
        print("║  ❌ MISSING CREDENTIALS — Cannot connect to API  ║")
        print("╚══════════════════════════════════════════════════╝")
        for m in missing:
            print(f"  → {m} is not set in .env")
        if "GOOGLE_ADS_REFRESH_TOKEN" in missing:
            print("\n  Run: python get_refresh_token.py")
            print("  to generate your refresh token.\n")
        raise SystemExit(1)

    return GoogleAdsClient.load_from_dict(config)

def run_query(client: GoogleAdsClient, customer_id: str, query: str) -> list[dict]:
    """
    Execute a GAQL query and return results as a list of dicts.

    Args:
        client: Authenticated GoogleAdsClient
        customer_id: Google Ads customer ID (no dashes)
        query: GAQL query string

    Returns:
        List of row dicts with dotted attribute paths as keys.
    """
    ga_service = client.get_service("GoogleAdsService")
    rows = []
    try:
        response = ga_service.search(customer_id=customer_id, query=query)
        for row in response:
            rows.append(row)
    except GoogleAdsException as ex:
        print(f"[GoogleAds ERROR] Request ID: {ex.request_id}")
        for error in ex.failure.errors:
            print(f"  → {error.error_code}: {error.message}")
        raise
    return rows


def mutate(client: GoogleAdsClient, customer_id: str, operations: list, service_name: str = "GoogleAdsService"):
    """
    Execute mutate operations (create, update, remove).

    Args:
        client: Authenticated GoogleAdsClient
        customer_id: Google Ads customer ID
        operations: List of MutateOperation objects
        service_name: The service to call mutate on

    Returns:
        MutateGoogleAdsResponse
    """
    service = client.get_service(service_name)
    try:
        response = service.mutate(customer_id=customer_id, mutate_operations=operations)
        return response
    except GoogleAdsException as ex:
        print(f"[GoogleAds MUTATE ERROR] Request ID: {ex.request_id}")
        for error in ex.failure.errors:
            print(f"  → {error.error_code}: {error.message}")
        raise


# ─── Convenience helpers ─────────────────────────────────────


def get_env_float(key: str, default: float = 0.0) -> float:
    """Read a float from environment."""
    return float(os.getenv(key, str(default)))


def get_env_bool(key: str, default: bool = False) -> bool:
    """Read a boolean from environment."""
    return os.getenv(key, str(default)).lower() in ("true", "1", "yes")


def get_env_int(key: str, default: int = 0) -> int:
    """Read an int from environment."""
    return int(os.getenv(key, str(default)))
