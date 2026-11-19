"""WAHA adapter for text messages from one configured session."""
import hmac
import logging
import os

import httpx
from fastapi import APIRouter, HTTPException, Request

from app.gemini_service import chat_with_tools
from app.conversations import whatsapp_conversation, get_messages, save_exchange
from app.models import ChatMessage

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/whatsapp')
async def send_text(session: str, chat_id: str, text: str):
    base = os.getenv('WAHA_URL', '').rstrip('/')
    if not base:
        raise ValueError('WAHA_URL is missing')
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(f'{base}/api/sendText',
            headers={'X-Api-Key': os.getenv('WAHA_API_KEY', '')},
            json={'session': session, 'chatId': chat_id, 'text': text})
        response.raise_for_status()


@router.post('/webhook')
async def webhook(request: Request):
    secret = os.getenv('WAHA_WEBHOOK_SECRET')
    configured_session = os.getenv('WAHA_SESSION')
    if not secret or not configured_session:
        raise HTTPException(503, 'WhatsApp is not configured')
    if not hmac.compare_digest(request.headers.get('X-Webhook-Secret', ''), secret):
        raise HTTPException(401, 'Invalid webhook secret')
    data = await request.json()
    if data.get('event') != 'message' or data.get('session') != configured_session:
        return {'status': 'ignored'}
    payload = data.get('payload') or {}
    if payload.get('fromMe') or not payload.get('from', '').endswith('@c.us'):
        return {'status': 'ignored'}
    message = payload.get('body') or ''
    # Media messages are not processed by the text adapter.
    if payload.get('hasMedia') or payload.get('media'):
        return {'status': 'ignored'}
    try:
        if not message.strip():
            return {'status': 'ignored'}
        if len(message) > 4000:
            raise ValueError('Message too long')
        conversation_id = whatsapp_conversation(configured_session, payload['from'])
        history = [ChatMessage(**item) for item in get_messages(conversation_id)[-20:]]
        result = await chat_with_tools(message, history)
        await send_text(configured_session, payload['from'], result.reply)
        save_exchange(conversation_id, message, result.reply)
        return {'status': 'replied'}
    except Exception as error:
        logger.warning('WhatsApp processing failed: %s', type(error).__name__)
        raise HTTPException(503, 'WhatsApp message processing failed') from error
