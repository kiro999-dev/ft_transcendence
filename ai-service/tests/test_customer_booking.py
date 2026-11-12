import asyncio
import os
import tempfile
import unittest
from datetime import datetime
from unittest.mock import AsyncMock, patch

import httpx
from fastapi import HTTPException

from app.backend_context import BackendIdentity, identity
from app.booking_confirmation import confirm_booking
from app.main import app
from app.models import BookingConfirmation, ChatResult, CustomerContext
from app.protection import requests

HTTP_CLIENT = httpx.AsyncClient

ORG = '11111111-1111-4111-8111-111111111111'
LEAD = '22222222-2222-4222-8222-222222222222'
CONTACT = '33333333-3333-4333-8333-333333333333'
PROPERTY = '44444444-4444-4444-8444-444444444444'
AGENT = '55555555-5555-4555-8555-555555555555'
CONTEXT = {'organization_id': ORG, 'lead_id': LEAD, 'contact_id': CONTACT}
CONFIRM = {'property_id': PROPERTY, 'agent_id': AGENT, 'starts_at': '2026-11-20T10:00:00Z', 'confirmed_by_customer': True}
SLOT = {'starts_at': CONFIRM['starts_at'], 'ends_at': '2026-11-20T10:30:00Z', 'agent_id': AGENT, 'agent_name': 'Test Agent'}
RESULT = {'visit_id': LEAD, 'status': 'confirmed', 'starts_at': CONFIRM['starts_at']}


class CustomerBookingTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {'AI_API_TOKEN': 'gateway', 'AI_SERVICE_TOKEN': '', 'BOOKING_ENABLED': 'true',
                    'AI_DATABASE_PATH': self.tmp.name + '/test.db', 'PROPERTY_SOURCE': 'mock', 'AI_REQUESTS_PER_MINUTE': '100'})
        self.env.start()
        requests.clear()
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test')
        self.headers = {'Authorization': 'Bearer gateway', 'X-Backend-Token': 'session-token'}

    async def asyncTearDown(self):
        await self.client.aclose()
        self.env.stop()
        self.tmp.cleanup()

    def backend_client(self, organization=ORG):
        def handler(request):
            self.assertEqual(request.headers['Authorization'], 'Bearer session-token')
            if request.url.path == '/users/me':
                return httpx.Response(200, json={'organization_id': organization})
            if request.url.path == '/properties/' + PROPERTY:
                return httpx.Response(200, json={'status': 'available'})
            raise AssertionError('Unexpected request ' + str(request.url))
        return HTTP_CLIENT(transport=httpx.MockTransport(handler))

    async def test_context_requires_authenticated_gateway(self):
        r = await self.client.post('/chat', json={'message': 'Hello', 'context': CONTEXT})
        self.assertEqual(r.status_code, 401)

    async def test_context_requires_backend_token(self):
        r = await self.client.post('/chat', headers={'Authorization': 'Bearer gateway'}, json={'message': 'Hello', 'context': CONTEXT})
        self.assertEqual(r.status_code, 422)

    async def test_backend_mode_chat_is_protected(self):
        with patch.dict(os.environ, {'PROPERTY_SOURCE': 'backend'}):
            for path in ('/chat', '/chat/stream'):
                r = await self.client.post(path, json={'message': 'Hello'})
                self.assertEqual(r.status_code, 401)

    async def test_agency_mismatch_rejected(self):
        with patch('app.backend_context.httpx.AsyncClient', return_value=self.backend_client(LEAD)):
            r = await self.client.post('/chat', headers=self.headers, json={'message': 'Hello', 'context': CONTEXT})
        self.assertEqual(r.status_code, 403)

    async def test_request_context_is_reset(self):
        async def chat(*args):
            self.assertEqual(identity.get().customer.lead_id, LEAD)
            self.assertEqual(identity.get().token, 'session-token')
            return ChatResult(reply='Hello')
        with patch('app.backend_context.httpx.AsyncClient', return_value=self.backend_client()), patch('app.main.chat_with_tools', side_effect=chat):
            r = await self.client.post('/chat', headers=self.headers, json={'message': 'Hello', 'context': CONTEXT})
        self.assertEqual(r.status_code, 200)
        self.assertIsNone(identity.get())

    async def test_customer_confirmation_uses_trusted_ids_without_model(self):
        with patch('app.backend_context.httpx.AsyncClient', return_value=self.backend_client()), \
             patch('app.booking_confirmation.httpx.AsyncClient', side_effect=lambda **kwargs: self.backend_client()), \
             patch('app.booking_confirmation.get_availability', new=AsyncMock(return_value={'slots': [SLOT]})), \
             patch('app.booking_confirmation.create_visit', new=AsyncMock(return_value=RESULT)) as create, \
             patch('app.main.chat_with_tools') as model:
            r = await self.client.post('/chat', headers=self.headers, json={'message': 'Confirm', 'context': CONTEXT, 'booking_confirmation': CONFIRM})
        self.assertEqual(r.status_code, 200, r.text)
        self.assertEqual(r.json()['booking'], RESULT)
        self.assertEqual(create.call_args.args[0]['lead_id'], LEAD)
        self.assertEqual(create.call_args.args[0]['contact_id'], CONTACT)
        self.assertNotIn('confirmed_by_customer', create.call_args.args[0])
        model.assert_not_called()

    async def test_stale_or_wrong_duration_slot_never_books(self):
        handle = identity.set(BackendIdentity('session-token', CustomerContext(**CONTEXT)))
        try:
            for slots in ([], [{**SLOT, 'ends_at': '2026-11-20T11:00:00Z'}]):
                with patch('app.booking_confirmation.httpx.AsyncClient', side_effect=lambda **kwargs: self.backend_client()), \
                     patch('app.booking_confirmation.get_availability', new=AsyncMock(return_value={'slots': slots})), \
                     patch('app.booking_confirmation.create_visit', new=AsyncMock()) as create:
                    with self.assertRaises(HTTPException) as error:
                        await confirm_booking(BookingConfirmation(**CONFIRM))
                    self.assertEqual(error.exception.status_code, 409)
                    create.assert_not_awaited()
        finally:
            identity.reset(handle)

    async def test_plain_text_does_not_create_booking(self):
        with patch('app.main.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Please confirm the selected slot'))), \
             patch('app.main.confirm_booking', new=AsyncMock()) as confirm:
            r = await self.client.post('/chat', json={'message': 'book it'})
        self.assertEqual(r.status_code, 200)
        confirm.assert_not_awaited()

    async def test_stream_confirmation_returns_booking_event(self):
        async def confirmed(*args):
            self.assertEqual(identity.get().token, 'session-token')
            return ChatResult(reply='Confirmed', booking=RESULT)
        with patch('app.backend_context.httpx.AsyncClient', side_effect=lambda **kwargs: self.backend_client()), \
             patch('app.stream_chat.confirm_booking', new=AsyncMock(side_effect=confirmed)) as confirm:
            r = await self.client.post('/chat/stream', headers=self.headers, json={'message': 'Confirm', 'context': CONTEXT, 'booking_confirmation': CONFIRM})
        self.assertEqual(r.status_code, 200)
        self.assertIn('event: booking', r.text)
        self.assertIn('event: done', r.text)
        confirm.assert_awaited_once()

    async def test_conversation_cannot_change_customer(self):
        headers = {'Authorization': 'Bearer gateway'}
        conversation = (await self.client.post('/conversations', headers=headers)).json()['conversation_id']
        with patch('app.backend_context.httpx.AsyncClient', side_effect=lambda **kwargs: self.backend_client()), \
             patch('app.main.chat_with_tools', new=AsyncMock(return_value=ChatResult(reply='Hi'))):
            first = await self.client.post(f'/conversations/{conversation}/messages', headers=self.headers, json={'message': 'Hi', 'context': CONTEXT})
            second = await self.client.post(f'/conversations/{conversation}/messages', headers=self.headers, json={'message': 'Hi', 'context': {**CONTEXT, 'contact_id': LEAD}})
        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 403)

    async def test_complete_confirmation_against_demo_backend(self):
        from app import mock_backend
        mock_backend.booked.clear()
        def backend(**kwargs):
            return HTTP_CLIENT(transport=httpx.ASGITransport(app=mock_backend.app), base_url='http://mock')
        payload = {
            'context': {**CONTEXT, 'organization_id': mock_backend.ORGANIZATION_ID},
            'property_id': mock_backend.PROPERTY_ID, 'agent_id': mock_backend.AGENT_ID,
            'starts_at': mock_backend.SLOT, 'confirmed_by_customer': True,
        }
        with patch('app.backend_context.httpx.AsyncClient', side_effect=backend):
            first = await self.client.post('/bookings', headers=self.headers, json=payload)
            second = await self.client.post('/bookings', headers=self.headers, json=payload)
        self.assertEqual(first.status_code, 200, first.text)
        self.assertEqual(first.json()['status'], 'demo')
        self.assertEqual(second.status_code, 409, second.text)
        mock_backend.booked.clear()

    async def test_concurrent_chats_keep_credentials_separate(self):
        async def chat(*args):
            current = identity.get()
            await asyncio.sleep(0)
            self.assertIs(identity.get(), current)
            return ChatResult(reply=current.token)
        def backend(**kwargs):
            return HTTP_CLIENT(transport=httpx.MockTransport(lambda request: httpx.Response(200, json={'organization_id': ORG})))
        with patch('app.backend_context.httpx.AsyncClient', side_effect=backend), patch('app.main.chat_with_tools', side_effect=chat):
            replies = await asyncio.gather(*[
                self.client.post('/chat', headers={**self.headers, 'X-Backend-Token': token},
                                 json={'message': 'Hello', 'context': CONTEXT})
                for token in ('session-one', 'session-two')])
        self.assertEqual([r.json()['reply'] for r in replies], ['session-one', 'session-two'])
        self.assertIsNone(identity.get())
