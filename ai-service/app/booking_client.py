import os
from datetime import date
from uuid import UUID

import httpx
from pydantic import ValidationError

from app.models import Availability


async def get_availability(property_id: str, preferred_date: str) -> dict:
    """Ask the backend for visit slots. Never calculate availability here."""
    try:
        UUID(property_id)
        date.fromisoformat(preferred_date)
    except ValueError:
        return {"error": "Use a real property UUID and a date in YYYY-MM-DD format."}

    base_url = os.getenv("BACKEND_URL", "http://localhost:3000")
    headers = {}
    token = os.getenv("AI_SERVICE_TOKEN")
    organization_id = os.getenv("AI_ORGANIZATION_ID")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if organization_id:
        headers["X-Organization-Id"] = organization_id

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{base_url.rstrip('/')}/internal/ai/availability",
                headers=headers,
                json={
                    "property_id": property_id,
                    "preferred_date": preferred_date,
                    "timezone": "Africa/Casablanca",
                },
            )
        response.raise_for_status()
        availability = Availability.model_validate(response.json())
        if availability.property_id != property_id or availability.date != preferred_date:
            return {"error": "The booking service returned slots for a different request."}
        return availability.model_dump(mode="json")
    except httpx.HTTPStatusError as error:
        if error.response.status_code == 404:
            return {"error": "The property or its agent was not found."}
        return {"error": "The booking service could not check availability. Try again later."}
    except (httpx.RequestError, ValidationError, ValueError):
        return {"error": "The booking service is unavailable or returned invalid data. Try again later."}
