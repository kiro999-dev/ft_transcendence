"""A separate, in-memory fake backend for learning and integration tests.

Run only for local development; it does not create real visits or properties.
"""
import asyncio
import uuid
from datetime import datetime
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel

app = FastAPI(title='AI demo backend (not real bookings)')
PROPERTY_ID = '11111111-1111-4111-8111-111111111111'
AGENT_ID = '22222222-2222-4222-8222-222222222222'
ORGANIZATION_ID = '33333333-3333-4333-8333-333333333333'
SLOT = '2026-11-10T10:00:00+01:00'
END = '2026-11-10T10:30:00+01:00'
booked = set()
lock = asyncio.Lock()


class Search(BaseModel):
    city: str | None = None
    property_type: str | None = None
    max_price: int | None = None
    min_bedrooms: int | None = None
    limit: int = 5


class AvailabilityRequest(BaseModel):
    property_id: str
    preferred_date: str
    timezone: str = 'Africa/Casablanca'


class VisitRequest(BaseModel):
    lead_id: uuid.UUID
    contact_id: uuid.UUID
    property_id: uuid.UUID
    agent_id: uuid.UUID
    starts_at: datetime
    customer_notes: str | None = None


@app.post('/internal/ai/properties/search')
async def search(filters: Search):
    prop = {'id': PROPERTY_ID, 'title': 'Demo villa', 'city': 'Marrakech', 'price': 1800000,
            'property_type': 'villa', 'bedrooms': 3, 'status': 'available', 'images': []}
    matches = (not filters.city or filters.city.lower() == 'marrakech') and (not filters.property_type or filters.property_type.lower() == 'villa')
    matches = matches and (filters.max_price is None or filters.max_price >= prop['price'])
    matches = matches and (filters.min_bedrooms is None or filters.min_bedrooms <= prop['bedrooms'])
    results = [prop] if matches and filters.limit > 0 else []
    return {'results': results, 'total': len(results), 'demo': True}


@app.get('/properties')
async def list_properties(response: Response, city: str | None = None,
                          property_type: str | None = None, maxPrice: int | None = None,
                          bedrooms: int | None = None, limit: int = 5,
                          status: str = 'available'):
    response.headers['X-AI-Demo'] = 'true'
    result = await search(Search(city=city, property_type=property_type,
                                 max_price=maxPrice, min_bedrooms=bedrooms, limit=limit))
    return result['results'] if status == 'available' else []


@app.get('/users/me')
async def demo_profile():
    return {'id': AGENT_ID, 'organization_id': ORGANIZATION_ID}


@app.get('/properties/{property_id}')
async def demo_property(property_id: str, response: Response):
    if property_id != PROPERTY_ID:
        raise HTTPException(404, 'Demo property not found')
    response.headers['X-AI-Demo'] = 'true'
    return (await search(Search()))['results'][0]


@app.post('/internal/ai/availability')
async def availability(request: AvailabilityRequest):
    if request.property_id != PROPERTY_ID:
        raise HTTPException(404, 'Demo property not found')
    slots = []
    if request.preferred_date == '2026-11-10' and SLOT not in booked:
        slots.append({'starts_at': SLOT, 'ends_at': END, 'agent_id': AGENT_ID, 'agent_name': 'Demo agent'})
    return {'property_id': PROPERTY_ID, 'date': request.preferred_date, 'slots': slots, 'demo': True}


@app.post('/internal/ai/visits')
async def visit(request: VisitRequest):
    if (str(request.property_id) != PROPERTY_ID or str(request.agent_id) != AGENT_ID or
            request.starts_at != datetime.fromisoformat(SLOT)):
        raise HTTPException(404, 'Demo slot not found')
    async with lock:
        if SLOT in booked:
            raise HTTPException(409, 'Demo slot unavailable')
        booked.add(SLOT)
    return {'visit_id': str(uuid.uuid4()), 'status': 'demo', 'property_id': PROPERTY_ID,
            'agent': {'id': AGENT_ID, 'name': 'Demo agent'}, 'starts_at': SLOT, 'ends_at': END,
            'message': 'This is a demo booking, not a real appointment.'}
