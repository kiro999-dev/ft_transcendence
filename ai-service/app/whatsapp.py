"""One WAHA session: resolve the customer, chat, and confirm selected visits."""
import asyncio
import hmac
import logging
import os
import re
import secrets
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx
from fastapi import APIRouter, HTTPException, Request

from app.backend_context import BackendIdentity, identity
from app.booking_confirmation import confirm_booking
from app.conversations import whatsapp_conversation, get_messages, save_exchange, bind_customer
from app.gemini_service import chat_with_tools
from app.models import ChatMessage, CustomerContext, BookingConfirmation
from app.whatsapp_state import get_slots, save_slots, get_reply, save_reply

logger = logging.getLogger(__name__)
router = APIRouter(prefix='/whatsapp')
# Run one AI worker. Messages from the same customer are handled in order.
locks = {}


async def send_text(session, chat_id, text):
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(os.environ['WAHA_URL'].rstrip('/') + '/api/sendText',
            headers={'X-Api-Key': os.environ['WAHA_API_KEY']},
            json={'session': session, 'chatId': chat_id, 'text': text})
        response.raise_for_status()


async def customer_identity(session, chat_id, name):
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(os.environ['BACKEND_URL'].rstrip('/') + '/internal/ai/whatsapp/context',
            headers={'X-AI-Gateway-Token': os.environ['AI_GATEWAY_TOKEN']},
            json={'session': session, 'chat_id': chat_id, 'name': name[:150]})
        response.raise_for_status()
    data = response.json()
    return BackendIdentity(data['backend_token'], CustomerContext(**data['context']))


async def phone_chat_id(session, chat_id):
    # WhatsApp sometimes sends a hidden @lid ID instead of the phone number.
    if chat_id.endswith('@lid'):
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(os.environ['WAHA_URL'].rstrip('/') +
                f'/api/{session}/lids/{chat_id.split("@")[0]}',
                headers={'X-Api-Key': os.environ['WAHA_API_KEY']})
            response.raise_for_status()
        chat_id = response.json().get('pn') or ''
    if not re.fullmatch(r'\d{7,20}@c\.us', chat_id):
        raise ValueError('Could not resolve customer phone number')
    return chat_id


def slot_label(slot):
    time = datetime.fromisoformat(slot['starts_at'].replace('Z', '+00:00'))
    time = time.astimezone(ZoneInfo('Africa/Casablanca'))
    return f"{slot['title']} — {time:%Y-%m-%d %H:%M} (Casablanca)"


async def reply_to_message(conversation_id, message):
    slots, selected, code = get_slots(conversation_id)
    command = message.strip().upper()
    if command == 'CANCEL':
        save_slots(conversation_id, [])
        return 'Selection cancelled. No new visit was booked.'
    choice = re.fullmatch(r'BOOK (\d+)', command)
    if choice:
        number = int(choice[1]) - 1
        if number < 0 or number >= len(slots):
            return 'Please choose one of the numbered slots from the latest list.'
        code = secrets.token_hex(3).upper()
        save_slots(conversation_id, slots, number, code)
        return f"Selected: {slot_label(slots[number])}.\nReply CONFIRM {code} to book, or CANCEL."
    if command.startswith('CONFIRM'):
        if selected is None or command != f'CONFIRM {code}':
            return 'Choose a slot using BOOK followed by its number, then send the confirmation code.'
        slot = slots[selected]
        # Clear the selection before creating a visit; never automatically retry it.
        save_slots(conversation_id, [])
        try:
            result = await confirm_booking(BookingConfirmation(
                property_id=slot['property_id'], agent_id=slot['agent_id'],
                starts_at=slot['starts_at'], confirmed_by_customer=True))
            return result.reply
        except HTTPException as error:
            return str(error.detail)
    history = [ChatMessage(**item) for item in get_messages(conversation_id)[-20:]]
    result = await chat_with_tools(message, history)
    offered = []
    titles = {p.id: p.title or 'Property visit' for p in result.properties}
    for available in result.availability:
        for slot in available.slots:
            offered.append({**slot.model_dump(mode='json'), 'property_id': available.property_id,
                            'title': titles.get(available.property_id, 'Property visit')})
    if offered:
        offered = offered[:10]
        save_slots(conversation_id, offered)
        options = '\n'.join(f'{i}. {slot_label(slot)}' for i, slot in enumerate(offered, 1))
        return result.reply + '\n\n' + options + '\nReply BOOK 1 (or another number) to select a visit.'
    return result.reply


@router.post('/webhook')
async def webhook(request: Request):
    secret = os.getenv('WAHA_WEBHOOK_SECRET')
    session = os.getenv('WAHA_SESSION', 'default')
    if not secret:
        raise HTTPException(503, 'WhatsApp is not configured')
    if not hmac.compare_digest(request.headers.get('X-Webhook-Secret', ''), secret):
        raise HTTPException(401, 'Invalid webhook secret')
    data = await request.json()
    if data.get('event') != 'message' or data.get('session') != session:
        return {'status': 'ignored'}
    payload = data.get('payload') or {}
    chat_id = payload.get('from', '')
    if payload.get('fromMe') or not re.fullmatch(r'\d{7,20}@(c\.us|lid)', chat_id):
        return {'status': 'ignored'}
    message = payload.get('body') or ''
    if payload.get('hasMedia') or payload.get('media') or not isinstance(message, str) or not message.strip():
        return {'status': 'ignored'}
    if len(message) > 4000:
        raise HTTPException(422, 'Message is too long')
    message_id = payload.get('id')
    if not isinstance(message_id, str) or not message_id:
        raise HTTPException(422, 'WhatsApp message ID is required')
    message_id = session + ':' + message_id
    async with locks.setdefault(chat_id, asyncio.Lock()):
        saved = get_reply(message_id)
        if saved and saved[1]:
            return {'status': 'duplicate'}
        if saved:
            reply = saved[0]
        else:
            try:
                phone_id = await phone_chat_id(session, chat_id)
                customer = await customer_identity(session, phone_id, str((payload.get('_data') or {}).get('notifyName') or ''))
                handle = identity.set(customer)
                try:
                    conversation_id = whatsapp_conversation(session, phone_id)
                    if not bind_customer(conversation_id, customer.customer):
                        raise ValueError('WhatsApp customer context changed')
                    reply = await reply_to_message(conversation_id, message)
                    save_exchange(conversation_id, message, reply)
                finally:
                    identity.reset(handle)
            except Exception as error:
                logger.warning('WhatsApp processing failed: %s', type(error).__name__)
                raise HTTPException(503, 'Could not process WhatsApp message') from error
            # Save before sending. A failed send can retry the reply, not the booking.
            save_reply(message_id, reply)
        try:
            await send_text(session, chat_id, reply)
        except httpx.HTTPError as error:
            raise HTTPException(503, 'Could not deliver WhatsApp reply') from error
        save_reply(message_id, reply, sent=True)
        return {'status': 'replied'}
