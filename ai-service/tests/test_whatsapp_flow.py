import os
import tempfile
import unittest
from unittest.mock import AsyncMock, patch

import httpx

from app.main import app
from app.backend_context import BackendIdentity, identity
from app.models import ChatResult, CustomerContext, Availability
from app.whatsapp_state import get_slots
from app.conversations import whatsapp_conversation

ORG = '11111111-1111-4111-8111-111111111111'
PROPERTY = '22222222-2222-4222-8222-222222222222'
AGENT = '33333333-3333-4333-8333-333333333333'
CUSTOMER = CustomerContext(organization_id=ORG, lead_id=PROPERTY, contact_id=AGENT)
CHAT = '212600000001@c.us'


class WhatsAppFlowTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {'AI_DATABASE_PATH': self.tmp.name + '/test.db',
            'WAHA_WEBHOOK_SECRET': 'secret', 'WAHA_SESSION': 'default'})
        self.env.start()
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test')
        self.customer = patch('app.whatsapp.customer_identity', new=AsyncMock(return_value=BackendIdentity('jwt', CUSTOMER)))
        self.customer.start()
        self.sender = patch('app.whatsapp.send_text', new=AsyncMock())
        self.send = self.sender.start()

    async def asyncTearDown(self):
        await self.client.aclose()
        self.customer.stop()
        self.sender.stop()
        self.env.stop()
        self.tmp.cleanup()

    async def message(self, text, message_id):
        return await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'}, json={
            'event': 'message', 'session': 'default',
            'payload': {'from': CHAT, 'id': message_id, 'body': text}})

    async def test_offer_select_confirm_and_ignore_duplicate(self):
        available = Availability(property_id=PROPERTY, date='2026-12-01', slots=[{
            'starts_at': '2026-12-01T10:00:00Z', 'ends_at': '2026-12-01T10:30:00Z',
            'agent_id': AGENT, 'agent_name': 'Test Agent'}])
        with patch('app.whatsapp.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Here is a visit.', availability=[available]))):
            response = await self.message('I want to visit', 'first')
        self.assertEqual(response.status_code, 200, response.text)
        self.assertIn('BOOK 1', self.send.call_args.args[2])
        response = await self.message('BOOK 1', 'second')
        self.assertEqual(response.status_code, 200)
        conversation = whatsapp_conversation('default', CHAT)
        code = get_slots(conversation)[2]
        self.assertIn('CONFIRM ' + code, self.send.call_args.args[2])
        async def confirm(data):
            self.assertEqual(identity.get().customer, CUSTOMER)
            self.assertEqual(data.property_id, PROPERTY)
            return ChatResult(reply='Your visit is confirmed.', booking={'status': 'confirmed'})
        with patch('app.whatsapp.confirm_booking', new=AsyncMock(side_effect=confirm)) as booking:
            wrong = await self.message('CONFIRM WRONG', 'wrong-code')
            self.assertEqual(wrong.status_code, 200)
            booking.assert_not_awaited()
            response = await self.message('CONFIRM ' + code, 'third')
            self.assertEqual(response.status_code, 200, response.text)
            duplicate = await self.message('CONFIRM ' + code, 'third')
            self.assertEqual(duplicate.json()['status'], 'duplicate')
            booking.assert_awaited_once()
        self.assertIsNone(identity.get())
        self.assertEqual(get_slots(conversation)[0], [])

    async def test_failed_send_retries_reply_without_reprocessing(self):
        self.send.side_effect = [httpx.ReadTimeout('send timeout'), None]
        with patch('app.whatsapp.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Hello'))) as model:
            self.assertEqual((await self.message('Hello', 'retry')).status_code, 503)
            self.assertEqual((await self.message('Hello', 'retry')).status_code, 200)
            model.assert_awaited_once()

    async def test_missing_message_id_is_rejected(self):
        response = await self.message('Hello', '')
        self.assertEqual(response.status_code, 422)

    async def test_self_group_and_media_are_ignored(self):
        for extra in ({'fromMe': True}, {'from': '123@g.us'}, {'hasMedia': True}):
            response = await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'}, json={
                'event': 'message', 'session': 'default', 'payload': {'from': CHAT, 'id': 'ignore', 'body': 'Hello', **extra}})
            self.assertEqual(response.json()['status'], 'ignored')
        self.send.assert_not_awaited()

    async def test_hidden_whatsapp_id_resolves_to_real_phone(self):
        from app.whatsapp import phone_chat_id
        def handle(request):
            self.assertEqual(request.url.path, '/api/default/lids/123456789012')
            return httpx.Response(200, json={'pn': CHAT})
        client = httpx.AsyncClient(transport=httpx.MockTransport(handle))
        with patch.dict(os.environ, {'WAHA_URL': 'http://waha:3000', 'WAHA_API_KEY': 'test'}), \
             patch('app.whatsapp.httpx.AsyncClient', return_value=client):
            self.assertEqual(await phone_chat_id('default', '123456789012@lid'), CHAT)
