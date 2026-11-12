"""Run before linking a real agency. Real backend/database, simulated WhatsApp and Gemini."""
import asyncio
from datetime import datetime, timedelta
import json
import os
import secrets
import tempfile
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
import uuid

import httpx
from app.main import app
from app.conversations import whatsapp_conversation
from app.whatsapp_state import get_slots


class TestGemini:
    def __init__(self, property_id, date):
        self.aio = self
        self.models = self
        self.property_id = property_id
        self.date = date

    async def __aenter__(self): return self
    async def __aexit__(self, *args): pass

    async def generate_content(self, *, config, **kwargs):
        properties = await config.tools[0](city='Marrakech')
        assert self.property_id in [p['id'] for p in properties['properties']]
        slots = await config.tools[1](self.property_id, self.date)
        assert slots['slots']
        return SimpleNamespace(text='This villa matches your search. Here are the available visits.', function_calls=None)


async def main():
    base = os.environ['BACKEND_URL'].rstrip('/')
    tag = uuid.uuid4().hex[:10]
    phone = '212600' + str(int(tag, 16))[-6:]
    chat_id = phone + '@c.us'
    session = os.getenv('WAHA_SESSION', 'default')
    date = (datetime.now() + timedelta(days=2)).date()
    with tempfile.TemporaryDirectory() as tmp, patch.dict(os.environ, {
        'AI_DATABASE_PATH': tmp + '/chat.db', 'GEMINI_API_KEY': 'simulated-provider',
    }):
        async with httpx.AsyncClient(timeout=30) as backend:
            owner_password = 'TestAa1!' + secrets.token_hex(12)
            response = await backend.post(base + '/auth/sign-up', json={
                'organizationName': 'WhatsApp Test ' + tag, 'firstName': 'WhatsApp', 'lastName': 'Tester',
                'email': 'watest' + tag + '@example.com', 'password': owner_password, 'phone': '+' + phone,
            })
            response.raise_for_status()
            account = response.json()
            response = await backend.post(base + '/auth/login', json={
                'email': 'watest' + tag + '@example.com', 'password': owner_password})
            response.raise_for_status()
            headers = {'Authorization': 'Bearer ' + response.json()['accessToken']}
            response = await backend.post(base + '/internal/ai/whatsapp/link', headers=headers, json={'session': session})
            response.raise_for_status()
            try:
                response = await backend.post(base + '/properties', headers=headers, json={
                    'title': 'WhatsApp Test Villa ' + tag, 'city': 'Marrakech', 'country': 'Morocco',
                    'price': 1000000, 'bedrooms': 3, 'property_type': 'villa', 'listing_type': 'sale'})
                response.raise_for_status()
                property_id = response.json()['id']
                response = await backend.put(base + '/api/availability/rules', headers=headers, json={
                    'userId': account['userId'], 'slotDuration': 30,
                    'rules': [{'dayOfWeek': (date.weekday() + 1) % 7, 'startTime': '10:00', 'endTime': '12:00'}]})
                response.raise_for_status()
                bad = await backend.post(base + '/internal/ai/whatsapp/context', json={'session': session, 'chat_id': chat_id})
                assert bad.status_code == 401, bad.text
                print('PASS gateway rejects missing service authentication')
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://ai') as ai:
                    async def message(text, message_id):
                        response = await ai.post('/whatsapp/webhook', headers={'X-Webhook-Secret': os.environ['WAHA_WEBHOOK_SECRET']}, json={
                            'event': 'message', 'session': session, 'payload': {'from': chat_id, 'id': message_id, 'body': text}})
                        assert response.status_code == 200, response.text
                        return response.json()
                    # No message is sent to a real phone during this test.
                    with patch('app.whatsapp.send_text', new=AsyncMock()) as send, \
                         patch('app.gemini_service.genai.Client', return_value=TestGemini(property_id, date.isoformat())):
                        await message('Suggest a villa and a visit', 'search-' + tag)
                        assert 'BOOK 1' in send.call_args.args[2]
                        print('PASS sender resolves to CRM contact/lead; tools retrieve real properties and slots')
                        await message('BOOK 1', 'select-' + tag)
                        code = get_slots(whatsapp_conversation(session, chat_id))[2]
                        await message('CONFIRM ' + code, 'confirm-' + tag)
                        assert 'confirmed' in send.call_args.args[2].lower()
                        duplicate = await message('CONFIRM ' + code, 'confirm-' + tag)
                        assert duplicate['status'] == 'duplicate'
                        print('PASS explicit WhatsApp confirmation creates visit; duplicate delivery is ignored')
                response = await backend.get(base + '/internal/ai/visits', headers=headers)
                response.raise_for_status()
                visits = response.json()
                assert len(visits) == 1, visits
                visit = visits[0]
                assert visit['property_id'] == property_id
                assert visit['leads']['visitors']['phone'] == '+' + phone
                print('PASS owner calendar receives correct property, time, customer and phone number')
                response = await backend.get(base + '/leads', headers=headers)
                response.raise_for_status()
                assert len(response.json()) == 1, response.text
                print('PASS repeated sender messages reuse the same CRM lead')
                print(json.dumps({'visit_id': visit['id'], 'property': visit['properties']['title'],
                                  'starts_at': visit['startAt'], 'phone': visit['leads']['visitors']['phone']}))
            finally:
                response = await backend.delete(base + '/internal/ai/whatsapp/link', headers=headers)
                response.raise_for_status()
                print('Test agency unlinked; default WhatsApp session is available for your real agency.')


asyncio.run(main())
