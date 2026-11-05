import os
import tempfile
import unittest
from unittest.mock import AsyncMock, patch
import httpx
from app.main import app
from app import rag, mock_backend
from app.models import ChatResult
from app.protection import requests


class BackendTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {'AI_API_TOKEN': 'local-test', 'AI_DATABASE_PATH': self.tmp.name + '/test.db', 'AI_REQUESTS_PER_MINUTE': '100'})
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

    async def test_whatsapp_text_reply_and_moderation(self):
        from app.message_analysis import MessageAnalysis
        payload = {'event': 'message', 'session': 'demo', 'payload': {'from': '123@c.us', 'body': 'Hello'}}
        analysis = MessageAnalysis(sentiment='neutral', sentiment_reason='Question', inappropriate=False, moderation_reason='None')
        with patch.dict(os.environ, {'WAHA_WEBHOOK_SECRET': 'secret', 'WAHA_SESSION': 'demo'}), \
             patch('app.whatsapp.analyze_message', new=AsyncMock(return_value=analysis)), \
             patch('app.whatsapp.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Hello!'))), \
             patch('app.whatsapp.send_text', new=AsyncMock()) as send:
            response = await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'}, json=payload)
        self.assertEqual(response.json()['status'], 'replied')
        send.assert_awaited_once_with('demo', '123@c.us', 'Hello!')

    async def test_audio_url_rejects_other_hosts(self):
        from app.whatsapp import download_audio
        with patch.dict(os.environ, {'WAHA_URL': 'http://waha:3000'}):
            with self.assertRaises(ValueError):
                await download_audio('http://other:3000/file', 'audio/ogg')

    async def test_whatsapp_voice_uses_transcription(self):
        from app.message_analysis import MessageAnalysis
        payload = {'event': 'message', 'session': 'demo', 'payload': {'from': '123@c.us',
                   'media': {'url': 'http://waha:3000/audio', 'mimetype': 'audio/ogg'}}}
        analysis = MessageAnalysis(sentiment='neutral', sentiment_reason='Question', inappropriate=False, moderation_reason='None')
        with patch.dict(os.environ, {'WAHA_WEBHOOK_SECRET': 'secret', 'WAHA_SESSION': 'demo'}), \
             patch('app.whatsapp.download_audio', new=AsyncMock(return_value=b'audio')), \
             patch('app.whatsapp.transcribe', new=AsyncMock(return_value='Hello from voice')), \
             patch('app.whatsapp.analyze_message', new=AsyncMock(return_value=analysis)) as analyze, \
             patch('app.whatsapp.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Hello'))), \
             patch('app.whatsapp.send_text', new=AsyncMock()) as send:
            response = await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'}, json=payload)
        self.assertEqual(response.json()['status'], 'replied')
        analyze.assert_awaited_once_with('Hello from voice')
        send.assert_awaited_once()

    async def test_whatsapp_warns_on_abuse(self):
        from app.message_analysis import MessageAnalysis
        payload = {'event': 'message', 'session': 'demo', 'payload': {'from': '123@c.us', 'body': 'Bad message'}}
        analysis = MessageAnalysis(sentiment='negative', sentiment_reason='Abusive', inappropriate=True, moderation_reason='Abuse')
        with patch.dict(os.environ, {'WAHA_WEBHOOK_SECRET': 'secret', 'WAHA_SESSION': 'demo'}), \
             patch('app.whatsapp.analyze_message', new=AsyncMock(return_value=analysis)), \
             patch('app.whatsapp.chat_with_tools', new=AsyncMock()) as chat, \
             patch('app.whatsapp.send_text', new=AsyncMock()) as send:
            response = await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'}, json=payload)
        self.assertEqual(response.json()['status'], 'moderated')
        chat.assert_not_awaited()
        send.assert_awaited_once()
