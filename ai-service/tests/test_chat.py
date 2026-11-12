import asyncio
import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import httpx

from app.main import app
from app.gemini_service import chat_with_tools
from app.property_mock import search_properties


class FakeGemini:
    """Call the supplied tool without sending a request to Google."""

    def __init__(self):
        self.aio = self
        self.models = self

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass

    async def generate_content(self, *, contents, config, **kwargs):
        # Interleave requests to check that their property lists stay separate.
        await asyncio.sleep(0)
        message = contents[-1].parts[0].text
        if message == "check booking":
            await config.tools[1](
                property_id="8da5d667-a895-42ac-bcb8-3de773c80179",
                preferred_date="2026-11-01",
            )
        else:
            await config.tools[0](city=message)
        return SimpleNamespace(text="Demo search completed.", function_calls=None)


class ChatTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.env = patch.dict(os.environ, {'PROPERTY_SOURCE': 'mock', 'AI_SERVICE_TOKEN': ''})
        self.env.start()
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")

    async def asyncTearDown(self):
        await self.client.aclose()
        self.env.stop()

    async def test_health_without_api_key(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual((await self.client.get('/health')).status_code, 200)
            response = await self.client.post('/chat', json={'message': 'Hello'})
        self.assertEqual(response.status_code, 503)

    async def test_invalid_messages(self):
        for message in ['', '   ', 'x' * 4001]:
            self.assertEqual((await self.client.post('/chat', json={'message': message})).status_code, 422)

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-key'})
    @patch('app.gemini_service.genai.Client', return_value=FakeGemini())
    async def test_structured_properties(self, client):
        response = await self.client.post('/chat', json={'message': 'marrakech'})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['property_source'], 'mock')
        self.assertEqual([p['id'] for p in data['properties']], ['prop-1', 'prop-2'])
        self.assertTrue(data['reply'])

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-key'})
    @patch('app.gemini_service.genai.Client', return_value=FakeGemini())
    async def test_empty_results(self, client):
        response = await self.client.post('/chat', json={'message': 'unknown city'})
        self.assertEqual(response.json()['properties'], [])

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-key'})
    @patch('app.gemini_service.genai.Client', return_value=FakeGemini())
    async def test_concurrent_requests_do_not_share_properties(self, client):
        async def run():
            return await asyncio.gather(chat_with_tools('marrakech'), chat_with_tools('casablanca'))
        first, second = await run()
        self.assertEqual([p.id for p in first.properties], ['prop-1', 'prop-2'])
        self.assertEqual([p.id for p in second.properties], ['prop-3'])

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-key'})
    @patch('app.gemini_service.genai.Client', side_effect=RuntimeError('private provider details'))
    async def test_provider_failure_is_safe(self, client):
        response = await self.client.post('/chat', json={'message': 'Hello'})
        self.assertEqual(response.status_code, 503)
        self.assertNotIn('private provider details', response.text)

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-key'})
    @patch('app.gemini_service.genai.Client', return_value=FakeGemini())
    async def test_booking_tool_returns_structured_results_and_errors(self, client):
        data = {'property_id': '8da5d667-a895-42ac-bcb8-3de773c80179',
                'date': '2026-11-01', 'slots': []}
        with patch('app.gemini_service.fetch_availability', return_value=data):
            response = await self.client.post('/chat', json={'message': 'check booking'})
        self.assertEqual(response.json()['availability'], [data])
        self.assertEqual(response.json()['tool_errors'], [])
        with patch('app.gemini_service.fetch_availability', return_value={'error': 'Unavailable'}):
            response = await self.client.post('/chat', json={'message': 'check booking'})
        self.assertEqual(response.json()['availability'], [])
        self.assertEqual(response.json()['tool_errors'], ['Unavailable'])

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test-key'})
    @patch('app.gemini_service.genai.Client', return_value=FakeGemini())
    async def test_history_is_sent_to_gemini(self, client):
        fake = client.return_value
        original = fake.generate_content
        seen = []
        async def capture(**kwargs):
            seen.extend(kwargs['contents'])
            return await original(**kwargs)
        fake.generate_content = capture
        response = await self.client.post('/chat', json={
            'message': 'marrakech', 'history': [
                {'role': 'user', 'content': 'I need a home'},
                {'role': 'assistant', 'content': 'Which city?'},
            ]})
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item.role for item in seen], ['user', 'model', 'user'])
        self.assertEqual(seen[0].parts[0].text, 'I need a home')

    async def test_history_limit(self):
        response = await self.client.post('/chat', json={
            'message': 'Hello', 'history': [{'role': 'user', 'content': 'Hi'}] * 21})
        self.assertEqual(response.status_code, 422)

    async def test_zero_budget_returns_no_properties(self):
        self.assertEqual(search_properties(max_price=0)['properties'], [])


if __name__ == '__main__':
    unittest.main()
