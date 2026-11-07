"""Search the property service using the proposed team API contract."""
import os
import httpx


async def search_properties(city=None, property_type=None, max_price=None, bedrooms=None):
    base_url = os.getenv("BACKEND_URL", "http://localhost:3000").rstrip("/")
    token = os.getenv("AI_SERVICE_TOKEN")
    organization = os.getenv("AI_ORGANIZATION_ID")
    if not token or not organization:
        return {"error": "Property service credentials are not configured."}
    headers = {"Authorization": f"Bearer {token}", "X-Organization-Id": organization}
    filters = {"city": city, "property_type": property_type, "max_price": max_price,
               "min_bedrooms": bedrooms, "limit": 5}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(f"{base_url}/internal/ai/properties/search",
                                         headers=headers, json=filters)
        response.raise_for_status()
        data = response.json()
        if not isinstance(data, dict) or not isinstance(data.get("results"), list):
            raise ValueError("Invalid response")
        properties = []
        for item in data["results"]:
            if not isinstance(item, dict) or item.get("status") != "available":
                continue
            if not all(item.get(key) is not None for key in ("id", "city", "price", "property_type")):
                raise ValueError("Incomplete property")
            properties.append(item)
        return {"properties": properties, "demo": data.get("demo") is True}
    except (httpx.HTTPError, ValueError):
        return {"error": "Property search is unavailable. Please try again later."}
