"""Get an access token for the locally configured test agency."""
import json
import os
from pathlib import Path
import httpx


async def backend_token():
    credentials_path = os.getenv('AI_BACKEND_CREDENTIALS_FILE')
    if not credentials_path:
        return os.getenv('AI_SERVICE_TOKEN')
    try:
        credentials = json.loads(Path(credentials_path).read_text())
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(os.getenv('BACKEND_URL', 'http://localhost:3000').rstrip('/') + '/auth/login',
                json={'email': credentials['email'], 'password': credentials['password']})
        response.raise_for_status()
        return response.json().get('accessToken')
    except (OSError, KeyError, ValueError, httpx.HTTPError):
        return None
