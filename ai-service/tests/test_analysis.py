import unittest
from unittest.mock import AsyncMock, patch

import httpx
from app.main import app
from app.message_analysis import MessageAnalysis
from app.gemini_service import AIServiceError


class AnalysisTests(unittest.IsolatedAsyncioTestCase):
    async def test_analysis_response(self):
        analysis = MessageAnalysis(sentiment='negative', sentiment_reason='Frustrated',
                                   inappropriate=False, moderation_reason='No abuse')
        with patch('app.main.analyze_message', new=AsyncMock(return_value=analysis)):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
                response = await client.post('/analyze', json={'message': 'I am frustrated'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['sentiment'], 'negative')
        self.assertFalse(response.json()['inappropriate'])

    async def test_analysis_failure(self):
        with patch('app.main.analyze_message', new=AsyncMock(side_effect=AIServiceError('Unavailable'))):
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url='http://test') as client:
                response = await client.post('/analyze', json={'message': 'Hello'})
        self.assertEqual(response.status_code, 503)
