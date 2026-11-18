import os
import tempfile
import unittest
from unittest.mock import AsyncMock, patch

import httpx
from cryptography.fernet import Fernet
from app.main import app
from app.models import ChatResult
from app.message_analysis import MessageAnalysis
from app.whatsapp_sessions import save_session, agency_session, session_for_agency
from app.conversations import connect


class WhatsAppAgencyTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.environment = patch.dict(os.environ, {'AI_DATABASE_PATH': self.temp.name + '/data.db',
            'AI_SESSION_ENCRYPTION_KEY': Fernet.generate_key().decode(), 'WAHA_WEBHOOK_SECRET': 'secret'})
        self.environment.start()
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test')
        save_session('agency-a', 'session-a', 'a@example.com', 'password-a')
        save_session('agency-b', 'session-b', 'b@example.com', 'password-b')

    async def asyncTearDown(self):
        await self.client.aclose()
        self.environment.stop()
        self.temp.cleanup()

    async def test_credentials_are_encrypted_and_sessions_are_separate(self):
        self.assertEqual(session_for_agency('agency-a'), 'session-a')
        self.assertEqual(agency_session('session-b')[0], 'agency-b')
        with connect() as db:
            stored = db.execute('SELECT credentials FROM agency_whatsapp_sessions WHERE session_name=?', ('session-a',)).fetchone()[0]
        self.assertNotIn(b'password-a', stored)

    async def test_webhooks_route_own_agency_and_ignore_unknown_sessions(self):
        analysis = MessageAnalysis(sentiment='neutral', sentiment_reason='Greeting', inappropriate=False, moderation_reason='None')
        async def login(agency, credentials):
            return 'token-' + agency
        with patch('app.whatsapp.analyze_message', new=AsyncMock(return_value=analysis)), \
             patch('app.whatsapp.login_for_agency', side_effect=login), \
             patch('app.whatsapp.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Hello'))) as chat, \
             patch('app.whatsapp.send_text', new=AsyncMock()):
            for session in ('session-a', 'session-b', 'unknown'):
                result = await self.client.post('/whatsapp/webhook', headers={'X-Webhook-Secret': 'secret'},
                    json={'event': 'message', 'session': session, 'payload': {'from': '123@c.us', 'body': 'Hello'}})
                self.assertEqual(result.json()['status'], 'ignored' if session == 'unknown' else 'replied')
            self.assertEqual([c.args[2:] for c in chat.await_args_list], [('agency-a', 'token-agency-a'), ('agency-b', 'token-agency-b')])
