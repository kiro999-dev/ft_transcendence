"""Confirm visits outside the model, using trusted CRM identity and fresh slots."""
from datetime import datetime
from zoneinfo import ZoneInfo
import os

import httpx
from fastapi import HTTPException

from app.backend_context import identity, backend_headers
from app.booking_client import get_availability, create_visit
from app.models import BookingConfirmation, ChatResult


async def confirm_booking(confirmation: BookingConfirmation) -> ChatResult:
    current = identity.get()
    if not current or not current.customer:
        raise HTTPException(422, 'Booking requires trusted customer context')
    if os.getenv('BOOKING_ENABLED', '').lower() != 'true':
        raise HTTPException(503, 'Booking creation is not enabled')
    base = os.getenv('BACKEND_URL', 'http://localhost:3000').rstrip('/')
    # Availability currently searches by UUID alone. Check agency access first.
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(base + '/properties/' + confirmation.property_id,
                                        headers=backend_headers())
        if response.status_code == 404:
            raise HTTPException(404, 'Property not found for this agency')
        response.raise_for_status()
        if response.json().get('status') != 'available':
            raise HTTPException(409, 'Property is no longer available')
    except (httpx.HTTPError, ValueError):
        raise HTTPException(503, 'Could not verify the property')
    day = confirmation.starts_at.astimezone(ZoneInfo('Africa/Casablanca')).date().isoformat()
    availability = await get_availability(confirmation.property_id, day)
    if 'error' in availability:
        raise HTTPException(503, availability['error'])
    slot = next((item for item in availability['slots']
                 if item['agent_id'] == confirmation.agent_id
                 and datetime.fromisoformat(item['starts_at'].replace('Z', '+00:00')) == confirmation.starts_at), None)
    if slot is None:
        raise HTTPException(409, 'This slot is no longer available')
    duration = (datetime.fromisoformat(slot['ends_at'].replace('Z', '+00:00')) - confirmation.starts_at).total_seconds() / 60
    # Keep this learning MVP at 30 minutes, matching the default booking duration.
    if duration != 30:
        raise HTTPException(409, 'This MVP currently supports 30-minute visits')
    data = confirmation.model_dump(mode='json', exclude={'confirmed_by_customer'})
    data.update(lead_id=current.customer.lead_id, contact_id=current.customer.contact_id)
    result = await create_visit(data)
    if 'error' in result:
        raise HTTPException(409 if 'no longer available' in result['error'] else 503, result['error'])
    reply = ('Demo visit created; this is not a real appointment.' if result['status'] == 'demo'
             else 'Your visit is confirmed for ' + result['starts_at'] + '.')
    return ChatResult(reply=reply, property_source='backend', booking=result)
