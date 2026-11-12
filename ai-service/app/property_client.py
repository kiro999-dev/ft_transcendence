"""Search the backend's authenticated GET /properties API."""
import os
import httpx
from app.models import Property
from app.backend_context import backend_headers


async def search_properties(city=None, property_type=None, max_price=None, bedrooms=None):
    base_url = os.getenv("BACKEND_URL", "http://localhost:3000").rstrip("/")
    headers = backend_headers()
    if not headers.get('Authorization'):
        return {"error": "Property service credentials are not configured."}
    # The backend derives the agency from the signed JWT, not a caller header.
    headers = {"Authorization": headers['Authorization']}
    filters = {"city": city, "property_type": property_type, "maxPrice": max_price,
               "bedrooms": bedrooms, "limit": 5, "status": "available"}
    filters = {key: value for key, value in filters.items() if value is not None}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(f"{base_url}/properties",
                                        headers=headers, params=filters)
        response.raise_for_status()
        data = response.json()
        if not isinstance(data, list):
            raise ValueError("Invalid response")
        properties = []
        for item in data:
            if not isinstance(item, dict) or item.get("status") != "available":
                continue
            if not all(item.get(key) is not None for key in ("id", "city", "price", "property_type")):
                raise ValueError("Incomplete property")
            properties.append(Property.model_validate(item).model_dump())
        return {"properties": properties,
                "demo": response.headers.get("X-AI-Demo", "").lower() == "true"}
    except (httpx.HTTPError, ValueError):
        return {"error": "Property search is unavailable. Please try again later."}
