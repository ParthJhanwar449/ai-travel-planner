import os
from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "335608642228-asorcgqngtvo8tvn7oma4m15cckh4ov3.apps.googleusercontent.com")


def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60
        )
        return idinfo
    except Exception as e:
        print(f"--- GOOGLE VERIFY ERROR: {str(e)}")
        return None
