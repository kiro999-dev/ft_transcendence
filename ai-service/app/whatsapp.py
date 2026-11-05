"""WAHA webhook adapter. Only a configured session and media server are accepted."""
import asyncio
import hmac
import logging
import os
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, HTTPException, Request
from google import genai
from google.genai import types

from app.gemini_service import chat_with_tools
from app.message_analysis import analyze_message
from app.conversations import whatsapp_conversation, get_messages, save_exchange
from app.models import ChatMessage

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/whatsapp')
AUDIO_TYPES = {'audio/ogg', 'audio/opus', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/mp4'}
MAX_AUDIO = 10 * 1024 * 1024


async def transcribe(audio: bytes, mime_type: str):
    key = os.getenv('GEMINI_API_KEY')
    if not key:
        raise ValueError('Gemini key is missing')
    async with genai.Client(api_key=key, http_options=types.HttpOptions(timeout=30000)).aio as client:
        response = await asyncio.wait_for(client.models.generate_content(
            model=os.getenv('GEMINI_MODEL', 'gemini-flash-latest'),
            contents=['Transcribe the speech faithfully. Return only the transcript.',
                      types.Part.from_bytes(data=audio, mime_type=mime_type)]), timeout=45)
    if not response.text or not response.text.strip():
        raise ValueError('Empty transcript')
    return response.text.strip()


async def download_audio(url: str, mime_type: str):
    base = os.getenv('WAHA_URL', '').rstrip('/')
    expected = urlparse(base)
    actual = urlparse(url)
    if not base or actual.scheme not in ('http', 'https') or (actual.scheme, actual.netloc) != (expected.scheme, expected.netloc):
        raise ValueError('Media URL is not on the configured WAHA server')
    if mime_type not in AUDIO_TYPES:
        raise ValueError('Unsupported audio format')
    headers = {'X-Api-Key': os.getenv('WAHA_API_KEY', '')}
    data = bytearray()
    async with httpx.AsyncClient(timeout=20, follow_redirects=False) as client:
        async with client.stream('GET', url, headers=headers) as response:
            response.raise_for_status()
            async for chunk in response.aiter_bytes():
                data.extend(chunk)
                if len(data) > MAX_AUDIO:
                    raise ValueError('Audio is too large')
    if not data:
        raise ValueError('Audio is empty')
    return bytes(data)


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
    media = payload.get('media') or {}
    try:
        if media.get('mimetype', '').split(';')[0] in AUDIO_TYPES:
            mime = media['mimetype'].split(';')[0]
            message = await transcribe(await download_audio(media.get('url', ''), mime), mime)
        if not message.strip():
            return {'status': 'ignored'}
        if len(message) > 4000:
            raise ValueError('Message too long')
        analysis = await analyze_message(message)
        if analysis.inappropriate:
            await send_text(configured_session, payload['from'], 'Please keep the conversation respectful.')
            return {'status': 'moderated'}
        conversation_id = whatsapp_conversation(configured_session, payload['from'])
        history = [ChatMessage(**item) for item in get_messages(conversation_id)[-20:]]
        result = await chat_with_tools(message, history)
        await send_text(configured_session, payload['from'], result.reply)
        save_exchange(conversation_id, message, result.reply)
        return {'status': 'replied', 'sentiment': analysis.sentiment}
    except Exception as error:
        logger.warning('WhatsApp processing failed: %s', type(error).__name__)
        raise HTTPException(503, 'WhatsApp message processing failed') from error
