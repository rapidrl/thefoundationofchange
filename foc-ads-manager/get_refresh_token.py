"""
OAuth Helper — Generate a Google Ads API refresh token.

Run this script to authenticate with Google and get the refresh token
needed for the agent to access your Google Ads account.

Prerequisites:
    1. Create a Google Cloud project
    2. Enable the Google Ads API
    3. Create OAuth 2.0 credentials (Desktop app)
    4. Fill in CLIENT_ID and CLIENT_SECRET in your .env file

Usage:
    python get_refresh_token.py
"""

import os
from dotenv import load_dotenv

load_dotenv()


def main():
    client_id = os.getenv("GOOGLE_ADS_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_ADS_CLIENT_SECRET")

    if not client_id or not client_secret or client_id == "your_oauth_client_id":
        print("❌ Please fill in GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET in your .env file first.")
        print("   Get these from: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs")
        return

    print("═══ Google Ads OAuth — Refresh Token Generator ═══\n")
    print("This will open a browser window to authenticate with Google.\n")

    try:
        from google_ads.client import GoogleAdsClient

        # Use the built-in OAuth flow
        GoogleAdsClient.load_from_dict({
            "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", ""),
            "client_id": client_id,
            "client_secret": client_secret,
            "use_proto_plus": True,
        })
    except ImportError:
        # Manual flow using requests-oauthlib
        print("Using manual OAuth flow...\n")
        try:
            from requests_oauthlib import OAuth2Session
        except ImportError:
            print("Install requests-oauthlib: pip install requests-oauthlib")
            return

        SCOPES = ["https://www.googleapis.com/auth/adwords"]
        AUTH_URL = "https://accounts.google.com/o/oauth2/auth"
        TOKEN_URL = "https://oauth2.googleapis.com/token"
        REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"

        oauth = OAuth2Session(client_id, scope=SCOPES, redirect_uri=REDIRECT_URI)
        auth_url, state = oauth.authorization_url(AUTH_URL, access_type="offline", prompt="consent")

        print(f"1. Open this URL in your browser:\n\n   {auth_url}\n")
        print("2. Authorize the application")
        print("3. Copy the authorization code and paste it below:\n")

        code = input("Authorization code: ").strip()

        token = oauth.fetch_token(
            TOKEN_URL,
            code=code,
            client_secret=client_secret,
        )

        refresh_token = token.get("refresh_token")
        if refresh_token:
            print(f"\n✅ Success! Your refresh token:\n\n   {refresh_token}\n")
            print("Add this to your .env file as GOOGLE_ADS_REFRESH_TOKEN")

            # Offer to update .env automatically
            update = input("\nUpdate .env automatically? (y/n): ").strip().lower()
            if update == "y":
                env_path = os.path.join(os.path.dirname(__file__), ".env")
                with open(env_path, "r") as f:
                    content = f.read()
                content = content.replace(
                    "GOOGLE_ADS_REFRESH_TOKEN=",
                    f"GOOGLE_ADS_REFRESH_TOKEN={refresh_token}",
                )
                with open(env_path, "w") as f:
                    f.write(content)
                print("✅ .env updated!")
        else:
            print("❌ No refresh token received. Try again with prompt=consent.")


if __name__ == "__main__":
    main()
