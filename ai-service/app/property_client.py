"""Search the backend's organization-scoped property endpoint."""
import os
import httpx
from app.backend_auth import backend_token


async def search_properties(city=None, property_type=None, max_price=None, bedrooms=None, access_token=None):
    base_url = os.getenv('BACKEND_URL', 'http://localhost:3000').rstrip('/')
    token = access_token or await backend_token()
    if not token:
        return {'error': 'Property service credentials are not configured.'}
    filters = {'city': city, 'property_type': property_type, 'maxPrice': max_price,
               'bedrooms': bedrooms, 'status': 'available', 'limit': 5}
    filters = {key: value for key, value in filters.items() if value is not None}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f'{base_url}/properties',
                headers={'Authorization': f'Bearer {token}'}, params=filters)
        response.raise_for_status()
        data = response.json()
        if not isinstance(data, list):
            raise ValueError('Invalid response')
        properties = []
        for item in data:
            if not isinstance(item, dict) or item.get('status') != 'available':
                continue
            if not all(item.get(key) is not None for key in ('id', 'city', 'price', 'property_type')):
                raise ValueError('Incomplete property')
            properties.append(item)
        return {'properties': properties}
    except (httpx.HTTPError, ValueError):
        return {'error': 'Property search is unavailable. Please try again later.'}
