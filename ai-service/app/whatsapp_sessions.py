"""Agency-owned WhatsApp sessions and encrypted backend login credentials."""
import json
import os
import sqlite3
import uuid

import httpx
from cryptography.fernet import Fernet, InvalidToken
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.agency_context import agency_from_token, request_agency
from app.conversations import connect

router = APIRouter(prefix='/whatsapp/session', tags=['WhatsApp sessions'])


class AgencyCredentials(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=256)


def cipher():
    try:
        return Fernet(os.environ['AI_SESSION_ENCRYPTION_KEY'].encode())
    except (KeyError, ValueError):
        raise HTTPException(503, 'Session encryption is not configured.')


def init_table(db):
    db.execute('CREATE TABLE IF NOT EXISTS agency_whatsapp_sessions '
               '(organization_id TEXT PRIMARY KEY, session_name TEXT NOT NULL UNIQUE, credentials BLOB NOT NULL)')


def save_session(organization_id, session_name, email, password):
    encrypted = cipher().encrypt(json.dumps({'email': email, 'password': password}).encode())
    with connect() as db:
        init_table(db)
        try:
            db.execute('INSERT INTO agency_whatsapp_sessions VALUES (?, ?, ?) '
                       'ON CONFLICT(organization_id) DO UPDATE SET credentials=excluded.credentials',
                       (organization_id, session_name, encrypted))
        except sqlite3.IntegrityError:
            raise HTTPException(409, 'Session already belongs to another agency.')


def session_for_agency(organization_id):
    with connect() as db:
        init_table(db)
        row = db.execute('SELECT session_name FROM agency_whatsapp_sessions WHERE organization_id=?', (organization_id,)).fetchone()
    return row[0] if row else None


def agency_session(session):
    with connect() as db:
        init_table(db)
        row = db.execute('SELECT organization_id, credentials FROM agency_whatsapp_sessions WHERE session_name=?', (session,)).fetchone()
    if not row:
        return None
    try:
        return row[0], json.loads(cipher().decrypt(row[1]))
    except (InvalidToken, ValueError):
        raise HTTPException(503, 'Cannot decrypt session credentials.')


async def login_for_agency(organization_id, credentials):
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(os.getenv('BACKEND_URL', 'http://localhost:3000').rstrip('/') + '/auth/login', json=credentials)
        if response.status_code in (400, 401, 403):
            raise HTTPException(401, 'Agency service account login failed.')
        response.raise_for_status()
        token = response.json().get('accessToken')
        if not token:
            raise HTTPException(400, 'Use an agency service account without two-factor login for WhatsApp.')
        if await agency_from_token(token) != organization_id:
            raise HTTPException(403, 'Service account belongs to another agency.')
        return token
    except httpx.HTTPError:
        raise HTTPException(503, 'Agency login service unavailable.')


async def waha_request(method, path, **kwargs):
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.request(method, os.getenv('WAHA_URL', '').rstrip('/') + path,
                headers={'X-Api-Key': os.getenv('WAHA_API_KEY', '')}, **kwargs)
        return response
    except httpx.HTTPError:
        raise HTTPException(503, 'WhatsApp service unavailable.')


@router.post('')
async def register(credentials: AgencyCredentials, organization_id: str = Depends(request_agency)):
    await login_for_agency(organization_id, credentials.model_dump())
    name = session_for_agency(organization_id) or 'agency_' + uuid.UUID(organization_id).hex
    save_session(organization_id, name, credentials.email, credentials.password)
    response = await waha_request('GET', '/api/sessions/' + name)
    if response.status_code == 404:
        response = await waha_request('POST', '/api/sessions/', json={'name': name, 'start': True})
    if response.status_code >= 400:
        raise HTTPException(502, 'Could not create WhatsApp session.')
    return {'session': name, 'status': response.json().get('status')}


async def own_session(organization_id):
    name = session_for_agency(organization_id)
    if not name:
        raise HTTPException(404, 'WhatsApp session is not registered.')
    return name


@router.get('')
async def status(organization_id: str = Depends(request_agency)):
    name = await own_session(organization_id)
    result = await waha_request('GET', '/api/sessions/' + name)
    if result.status_code >= 400:
        raise HTTPException(502, 'Could not retrieve WhatsApp session.')
    return {'session': name, 'status': result.json().get('status')}


@router.get('/qr')
async def qr(organization_id: str = Depends(request_agency)):
    name = await own_session(organization_id)
    result = await waha_request('GET', f'/api/{name}/auth/qr')
    if result.status_code >= 400:
        raise HTTPException(409, 'QR code is not available for this session.')
    return Response(content=result.content, media_type=result.headers.get('content-type', 'image/png'), headers={'Cache-Control': 'no-store'})


@router.post('/{action}')
async def control(action: str, organization_id: str = Depends(request_agency)):
    if action not in ('start', 'restart', 'stop'):
        raise HTTPException(404, 'Unknown action.')
    name = await own_session(organization_id)
    result = await waha_request('POST', f'/api/sessions/{name}/{action}')
    if result.status_code >= 400:
        raise HTTPException(502, 'Could not change WhatsApp session state.')
    return {'session': name, 'status': result.json().get('status')}
