import os
import tempfile
import unittest
from unittest.mock import AsyncMock, patch
import httpx
from app.main import app
from app import rag, mock_backend
from app.models import ChatResult, CustomerContext
from app.backend_context import BackendIdentity
from app.protection import requests


class BackendTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {'PROPERTY_SOURCE': 'mock', 'AI_SERVICE_TOKEN': '', 'AI_API_TOKEN': 'local-test', 'AI_DATABASE_PATH': self.tmp.name + '/test.db', 'AI_REQUESTS_PER_MINUTE': '100'})
        self.env.start()
        requests.clear()
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test')

    async def asyncTearDown(self):
        await self.client.aclose()
        self.env.stop()
        self.tmp.cleanup()

    async def test_persistent_conversation_and_auth(self):
        self.assertEqual((await self.client.post('/conversations')).status_code, 401)
        headers = {'Authorization': 'Bearer local-test'}
        conversation_id = (await self.client.post('/conversations', headers=headers)).json()['conversation_id']
        with patch('app.main.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Hello'))):
            result = await self.client.post(f'/conversations/{conversation_id}/messages', headers=headers, json={'message': 'Hi'})
        self.assertEqual(result.status_code, 200)
        result = await self.client.get(f'/conversations/{conversation_id}', headers=headers)
        self.assertEqual([m['content'] for m in result.json()['messages']], ['Hi', 'Hello'])

    async def test_rate_limit(self):
        with patch.dict(os.environ, {'AI_REQUESTS_PER_MINUTE': '1'}):
            await self.client.post('/chat', json={'message': ''})
            self.assertEqual((await self.client.post('/chat', json={'message': 'Hi'})).status_code, 429)

    async def test_rag_empty_and_chunking(self):
        self.assertEqual(rag.chunks(''), [])
        parts = rag.chunks('x' * 2500)
        self.assertEqual(len(parts), 3)
        self.assertEqual(parts[0][-200:], parts[1][:200])
        with patch('app.rag.retrieve', new=AsyncMock(return_value=[])):
            self.assertEqual((await rag.answer('unknown'))['sources'], [])

    async def test_whatsapp_security(self):
        with patch.dict(os.environ, {'WAHA_WEBHOOK_SECRET': 'secret', 'WAHA_SESSION': 'demo'}):
            self.assertEqual((await self.client.post('/whatsapp/webhook', json={})).status_code, 401)
            response = await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'}, json={'event': 'other', 'session': 'demo'})
            self.assertEqual(response.json()['status'], 'ignored')

    async def test_mock_booking_conflict(self):
        mock_backend.booked.clear()
        client = httpx.AsyncClient(transport=httpx.ASGITransport(app=mock_backend.app), base_url='http://mock')
        data = {'lead_id': mock_backend.PROPERTY_ID, 'contact_id': mock_backend.PROPERTY_ID,
                'property_id': mock_backend.PROPERTY_ID, 'agent_id': mock_backend.AGENT_ID, 'starts_at': mock_backend.SLOT}
        first = await client.post('/internal/ai/visits', json=data)
        second = await client.post('/internal/ai/visits', json=data)
        await client.aclose()
        self.assertEqual(first.json()['status'], 'demo')
        self.assertEqual(second.status_code, 409)

    async def test_whatsapp_text_reply(self):
        payload = {'event': 'message', 'session': 'demo', 'payload': {'from': '212600000001@c.us', 'id': 'test-text-1', 'body': 'Hello'}}
        with patch.dict(os.environ, {'WAHA_WEBHOOK_SECRET': 'secret', 'WAHA_SESSION': 'demo'}), \
             patch('app.whatsapp.customer_identity', new=AsyncMock(return_value=BackendIdentity('test', CustomerContext(organization_id=mock_backend.ORGANIZATION_ID, lead_id=mock_backend.PROPERTY_ID, contact_id=mock_backend.AGENT_ID)))), \
             patch('app.whatsapp.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Hello!'))), \
             patch('app.whatsapp.send_text', new=AsyncMock()) as send:
            response = await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'}, json=payload)
        self.assertEqual(response.json()['status'], 'replied')
        send.assert_awaited_once_with('demo', '212600000001@c.us', 'Hello!')

    async def test_whatsapp_ignores_media(self):
        payload = {'event': 'message', 'session': 'demo', 'payload': {'from': '123@c.us', 'hasMedia': True}}
        with patch.dict(os.environ, {'WAHA_WEBHOOK_SECRET': 'secret', 'WAHA_SESSION': 'demo'}), \
             patch('app.whatsapp.send_text', new=AsyncMock()) as send:
            response = await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'}, json=payload)
        self.assertEqual(response.json()['status'], 'ignored')
        send.assert_not_awaited()
