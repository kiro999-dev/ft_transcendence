"""Resolve an agency from the backend, never from an unverified request field."""
import os
import uuid

import httpx
from fastapi import HTTPException, Request


async def agency_from_token(token: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                os.getenv('BACKEND_URL', 'http://localhost:3000').rstrip('/') + '/users/me',
                headers={'Authorization': 'Bearer ' + token},
            )
        if response.status_code in (401, 403, 404):
            raise HTTPException(status_code=401, detail='Invalid agency login.')
        response.raise_for_status()
        return str(uuid.UUID(response.json()['organization_id']))
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError, TypeError, KeyError):
        raise HTTPException(status_code=503, detail='Could not verify agency identity.')


async def request_agency(request: Request) -> str:
    authorization = request.headers.get('Authorization', '')
    if not authorization.startswith('Bearer ') or not authorization[7:].strip():
        raise HTTPException(status_code=401, detail='Agency login required.')
    return await agency_from_token(authorization[7:].strip())


async def context_agency() -> str | None:
    """Resolve the agency in the verified per-request backend context."""
    from app.backend_context import identity
    current = identity.get()
    if not current or not current.token:
        return None
    if current.customer:
        return current.customer.organization_id
    return await agency_from_token(current.token)
