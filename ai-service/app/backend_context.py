"""Request-local backend credentials and CRM identity supplied by a trusted gateway."""
from contextvars import ContextVar
from dataclasses import dataclass
import os

import httpx
from fastapi import HTTPException, Request

from app.models import CustomerContext
from app.protection import check_access


@dataclass(frozen=True)
class BackendIdentity:
    token: str
    customer: CustomerContext | None = None


identity: ContextVar[BackendIdentity | None] = ContextVar('backend_identity', default=None)


def backend_headers():
    current = identity.get()
    token = current.token if current else os.getenv('AI_SERVICE_TOKEN')
    organization = ((current.customer.organization_id if current.customer else None)
                    if current else os.getenv('AI_ORGANIZATION_ID'))
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    if organization:
        headers['X-Organization-Id'] = organization
    return headers


async def request_identity(request: Request):
    """Only the authenticated gateway may attach customer IDs or backend tokens."""
    try:
        payload = await request.json()
    except ValueError:
        raise HTTPException(422, "Invalid JSON request")
    customer_data = payload.get('context') if isinstance(payload, dict) else None
    token = request.headers.get('X-Backend-Token')
    if (customer_data is not None or token or os.getenv('AI_SERVICE_TOKEN')
            or os.getenv('PROPERTY_SOURCE', 'mock') == 'backend'):
        check_access(request)
    customer = None
    if customer_data is not None:
        from pydantic import ValidationError
        try:
            customer = CustomerContext.model_validate(customer_data)
        except ValidationError:
            raise HTTPException(422, 'Invalid customer context')
    if customer and not token:
        raise HTTPException(422, 'X-Backend-Token is required with customer context')
    if token:
        base = os.getenv('BACKEND_URL', 'http://localhost:3000').rstrip('/')
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(base + '/users/me', headers={'Authorization': 'Bearer ' + token})
            if response.status_code in (401, 403):
                raise HTTPException(401, 'Backend session is invalid or expired')
            response.raise_for_status()
            profile = response.json()
            if not isinstance(profile, dict) or not profile.get('organization_id'):
                raise ValueError('Backend profile has no agency')
            if customer and profile.get('organization_id') != customer.organization_id:
                raise HTTPException(403, 'Customer context does not match the backend agency')
        except (httpx.HTTPError, ValueError):
            raise HTTPException(503, 'Could not validate backend session')
    handle = identity.set(BackendIdentity(token, customer) if token else None)
    try:
        yield
    finally:
        identity.reset(handle)
