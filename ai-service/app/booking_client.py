import os
from datetime import date, datetime
from uuid import UUID

import httpx
from pydantic import ValidationError

from app.models import Availability
from app.backend_context import backend_headers


async def get_availability(property_id: str, preferred_date: str) -> dict:
    """Ask the backend for visit slots. Never calculate availability here."""
    try:
        UUID(property_id)
        date.fromisoformat(preferred_date)
    except ValueError:
        return {"error": "Use a real property UUID and a date in YYYY-MM-DD format."}

    base_url = os.getenv("BACKEND_URL", "http://localhost:3000")
    headers = backend_headers()

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            if headers.get('Authorization'):
                property_response = await client.get(
                    f"{base_url.rstrip('/')}/properties/{property_id}", headers=headers)
                property_response.raise_for_status()
                if property_response.json().get('status') != 'available':
                    return {"error": "The property is no longer available."}
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


async def create_visit(data: dict) -> dict:
    """Send an explicitly confirmed booking request to the booking service."""
    if os.getenv('BOOKING_ENABLED', '').lower() != 'true':
        return {'error': 'Booking creation is not enabled.'}
    headers = backend_headers()
    if not headers.get('Authorization') or not headers.get('X-Organization-Id'):
        return {'error': 'Booking service credentials are not configured.'}
    url = os.getenv('BACKEND_URL', 'http://localhost:3000').rstrip('/') + '/internal/ai/visits'
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=data, headers=headers)
        if response.status_code == 409:
            return {'error': 'This slot is no longer available.'}
        response.raise_for_status()
        result = response.json()
        if not isinstance(result, dict) or not result.get('visit_id') or result.get('status') not in ('confirmed', 'demo'):
            raise ValueError('Invalid booking response')
        if (result.get('property_id') != data.get('property_id')
                or not isinstance(result.get('agent'), dict)
                or result['agent'].get('id') != data.get('agent_id')):
            raise ValueError('Booking response does not match request')
        starts = datetime.fromisoformat(str(result.get('starts_at', '')).replace('Z', '+00:00'))
        ends = datetime.fromisoformat(str(result.get('ends_at', '')).replace('Z', '+00:00'))
        requested = datetime.fromisoformat(str(data.get('starts_at', '')).replace('Z', '+00:00'))
        if starts.utcoffset() is None or ends.utcoffset() is None or starts != requested or ends <= starts:
            raise ValueError('Invalid booking timestamps')
        return result
    except (httpx.HTTPError, ValueError):
        # A timeout does not prove that the backend failed to create a visit.
        return {'error': 'Booking result is unknown. Check with the agency before retrying.'}
