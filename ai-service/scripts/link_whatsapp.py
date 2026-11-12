"""One-time setup: log in as the owner and link the WAHA session to that agency."""
import getpass
import os
import httpx

base = os.environ['BACKEND_URL'].rstrip('/')
with httpx.Client(timeout=30) as client:
    response = client.post(base + '/auth/login', json={
        'email': input('Agency owner email: ').strip(),
        'password': getpass.getpass('Password: '),
    })
    response.raise_for_status()
    login = response.json()
    if login.get('twoFactorRequired'):
        response = client.post(base + '/auth/2fa/verify', json={
            'tempToken': login['tempToken'], 'code': input('Email verification code: ').strip(),
        })
        response.raise_for_status()
        login = response.json()
    response = client.post(base + '/internal/ai/whatsapp/link',
        headers={'Authorization': 'Bearer ' + login['accessToken']},
        json={'session': os.getenv('WAHA_SESSION', 'default')})
    response.raise_for_status()
print('WhatsApp session linked to your agency.')
print('Open http://localhost:3001/dashboard and scan the QR using WhatsApp > Linked devices.')
print('Dashboard login: WAHA_DASHBOARD_USERNAME and WAHA_DASHBOARD_PASSWORD in dk/.env.')
