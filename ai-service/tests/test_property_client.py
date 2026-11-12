import unittest
from unittest.mock import patch

import httpx

from app.property_client import search_properties


@patch.dict('os.environ', {'AI_SERVICE_TOKEN': 'test'}, clear=True)
class PropertyClientTests(unittest.IsolatedAsyncioTestCase):
    async def search_with_response(self, response, **filters):
        client = httpx.AsyncClient(transport=httpx.MockTransport(lambda request: response))
        with patch('app.property_client.httpx.AsyncClient', return_value=client):
            return await search_properties(**filters)

    async def test_search_filters_and_available_only(self):
        def handler(request):
            self.assertEqual(request.method, 'GET')
            self.assertEqual(str(request.url), 'http://localhost:3000/properties?city=Marrakech&property_type=villa&maxPrice=100&bedrooms=3&limit=5&status=available')
            self.assertEqual(request.headers['Authorization'], 'Bearer test')
            self.assertNotIn('X-Organization-Id', request.headers)
            return httpx.Response(200, json=[
                {'id': '1', 'city': 'Marrakech', 'price': '100.00', 'property_type': 'villa', 'status': 'available'},
                {'id': '2', 'city': 'Marrakech', 'price': 100, 'property_type': 'villa', 'status': 'sold'}])
        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        with patch('app.property_client.httpx.AsyncClient', return_value=client):
            result = await search_properties(city='Marrakech', property_type='villa', max_price=100, bedrooms=3)
        self.assertEqual([item['id'] for item in result['properties']], ['1'])
        self.assertEqual(result['properties'][0]['price'], 100.0)
        self.assertFalse(result['demo'])

    async def test_optional_filters_omitted_and_zero_preserved(self):
        def handler(request):
            self.assertEqual(dict(request.url.params), {'maxPrice': '0', 'bedrooms': '0', 'limit': '5', 'status': 'available'})
            return httpx.Response(200, json=[])
        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        with patch('app.property_client.httpx.AsyncClient', return_value=client):
            self.assertEqual((await search_properties(max_price=0, bedrooms=0))['properties'], [])

    @patch.dict('os.environ', {}, clear=True)
    async def test_missing_credentials(self):
        with patch('app.property_client.httpx.AsyncClient') as client:
            self.assertIn('error', await search_properties())
            client.assert_not_called()

    async def test_backend_failure(self):
        for status in (401, 403, 404, 500):
            self.assertIn('error', await self.search_with_response(httpx.Response(status)))

    async def test_invalid_response(self):
        for payload in ({'results': []}, [{'id': '1', 'status': 'available'}],
                        [{'id': '1', 'status': 'available', 'city': 'Marrakech', 'price': 'bad', 'property_type': 'villa'}]):
            self.assertIn('error', await self.search_with_response(httpx.Response(200, json=payload)))

    async def test_demo_marked_explicitly(self):
        result = await self.search_with_response(httpx.Response(200, json=[], headers={'X-AI-Demo': 'true'}))
        self.assertTrue(result['demo'])
