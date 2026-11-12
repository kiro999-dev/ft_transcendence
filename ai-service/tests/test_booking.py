import unittest
from unittest.mock import patch

import httpx

from app.booking_client import get_availability

PROPERTY_ID = '8da5d667-a895-42ac-bcb8-3de773c80179'


@patch.dict('os.environ', {'AI_SERVICE_TOKEN': ''})
class BookingTests(unittest.IsolatedAsyncioTestCase):
    async def request_with_response(self, response):
        def handle(request):
            self.assertEqual(request.url.path, '/internal/ai/availability')
            self.assertEqual(request.method, 'POST')
            return response
        client = httpx.AsyncClient(transport=httpx.MockTransport(handle))
        with patch('app.booking_client.httpx.AsyncClient', return_value=client):
            return await get_availability(PROPERTY_ID, '2026-11-01')

    async def test_slots(self):
        data = {'property_id': PROPERTY_ID, 'date': '2026-11-01', 'slots': [{
            'starts_at': '2026-11-01T09:00:00Z', 'ends_at': '2026-11-01T09:30:00Z',
            'agent_id': 'agent-id', 'agent_name': 'Test Agent',
        }]}
        result = await self.request_with_response(httpx.Response(200, json=data))
        self.assertEqual(result, data)

    async def test_empty_slots(self):
        data = {'property_id': PROPERTY_ID, 'date': '2026-11-01', 'slots': []}
        self.assertEqual(await self.request_with_response(httpx.Response(200, json=data)), data)

    async def test_missing_property_and_server_error(self):
        for status in [404, 401, 500]:
            self.assertIn('error', await self.request_with_response(httpx.Response(status)))

    async def test_invalid_response(self):
        for data in [{}, {'property_id': 'wrong', 'date': '2026-11-01', 'slots': []}]:
            self.assertIn('error', await self.request_with_response(httpx.Response(200, json=data)))

    async def test_invalid_input_never_calls_backend(self):
        with patch('app.booking_client.httpx.AsyncClient') as client:
            self.assertIn('error', await get_availability('prop-1', '2026-11-01'))
            self.assertIn('error', await get_availability(PROPERTY_ID, 'tomorrow'))
            client.assert_not_called()

    async def test_timeout(self):
        def handle(request):
            raise httpx.ReadTimeout('timeout')
        client = httpx.AsyncClient(transport=httpx.MockTransport(handle))
        with patch('app.booking_client.httpx.AsyncClient', return_value=client):
            self.assertIn('error', await get_availability(PROPERTY_ID, '2026-11-01'))

    @patch.dict('os.environ', {'BOOKING_ENABLED': 'true', 'AI_SERVICE_TOKEN': 'test', 'AI_ORGANIZATION_ID': 'org'})
    async def test_create_visit_conflict_and_uncertain_error(self):
        from app.booking_client import create_visit
        async def check(status):
            client = httpx.AsyncClient(transport=httpx.MockTransport(lambda request: httpx.Response(status)))
            with patch('app.booking_client.httpx.AsyncClient', return_value=client):
                return await create_visit({'property_id': PROPERTY_ID})
        self.assertIn('no longer available', (await check(409))['error'])
        self.assertIn('unknown', (await check(500))['error'])

    @patch.dict('os.environ', {'BOOKING_ENABLED': 'false'})
    async def test_create_visit_disabled(self):
        from app.booking_client import create_visit
        self.assertIn('not enabled', (await create_visit({}))['error'])
