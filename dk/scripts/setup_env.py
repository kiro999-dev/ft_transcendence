"""Create a local Docker .env. Never print credentials or replace existing secrets."""
from pathlib import Path
import secrets
from urllib.parse import quote

folder = Path(__file__).resolve().parents[1]


def read_env(path):
    values = {}
    if path.exists():
        for line in path.read_text().splitlines():
            if line.strip() and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                values[key.strip()] = value.strip().strip('"').strip("'")
    return values


values = read_env(folder / '.env.example')
values.update(read_env(folder / '.env'))
root = read_env(folder.parent / '.env')
if not values.get('GEMINI_API_KEY'):
    values['GEMINI_API_KEY'] = root.get('GEMINI_API_KEY', '')
for key in ('POSTGRES_PASSWORD', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET',
            'TEMP_TOKEN_SECRET', 'AI_API_TOKEN', 'AI_GATEWAY_TOKEN', 'WAHA_API_KEY',
            'WAHA_WEBHOOK_SECRET', 'WAHA_DASHBOARD_PASSWORD'):
    if not values.get(key):
        values[key] = secrets.token_hex(32)
# Every container reaches PostgreSQL by its Compose service name.
values['DATABASE_URL'] = ('postgresql://' + quote(values['POSTGRES_USER'], safe='') + ':'
    + quote(values['POSTGRES_PASSWORD'], safe='') + '@postgres:5432/'
    + quote(values['POSTGRES_DB'], safe='') + '?schema=public')
path = folder / '.env'
path.write_text('\n'.join(key + '=' + value for key, value in values.items()) + '\n')
path.chmod(0o600)
print('Docker settings saved in dk/.env. Add GEMINI_API_KEY there if it is empty.')
