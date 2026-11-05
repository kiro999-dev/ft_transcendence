import unittest
from unittest.mock import patch
import httpx
from app.property_client import search_properties


class PropertyClientTests(unittest.IsolatedAsyncioTestCase):
    @patch.dict('os.environ', {'AI_SERVICE_TOKEN': 'test', 'AI_ORGANIZATION_ID': 'org'})
    async def test_search_filters_and_available_only(self):
        def handler(request):
            self.assertEqual(request.url.path, '/internal/ai/properties/search')
            self.assertIn(b'"city":"Marrakech"', request.content)
            return httpx.Response(200, json={'results': [
                {'id': '1', 'city': 'Marrakech', 'price': 100, 'property_type': 'villa', 'status': 'available'},
                {'id': '2', 'city': 'Marrakech', 'price': 100, 'property_type': 'villa', 'status': 'sold'}]})
        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        with patch('app.property_client.httpx.AsyncClient', return_value=client):
            result = await search_properties(city='Marrakech')
        self.assertEqual([item['id'] for item in result['properties']], ['1'])

    @patch.dict('os.environ', {}, clear=True)
    async def test_missing_credentials(self):
        result = await search_properties()
        self.assertIn('error', result)

    @patch.dict('os.environ', {'AI_SERVICE_TOKEN': 'test', 'AI_ORGANIZATION_ID': 'org'})
    async def test_backend_failure(self):
        client = httpx.AsyncClient(transport=httpx.MockTransport(lambda request: httpx.Response(500)))
        with patch('app.property_client.httpx.AsyncClient', return_value=client):
            self.assertIn('error', await search_properties())
