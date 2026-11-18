import os
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.backend_context import BackendIdentity, identity
from app.gemini_service import chat_with_tools
from app.models import CustomerContext

ORG = '00000000-0000-4000-8000-000000000001'


class FakeGemini:
    def __init__(self):
        self.aio = self
        self.models = self
        self.tool_result = None

    async def __aenter__(self): return self
    async def __aexit__(self, *args): pass

    async def generate_content(self, *, config, **kwargs):
        self.tool_result = await config.tools[2]('What are your opening hours?')
        return SimpleNamespace(text='Done', function_calls=None)


class AgencyRagTests(unittest.IsolatedAsyncioTestCase):
    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test', 'RAG_ENABLED': 'true', 'PROPERTY_SOURCE': 'mock'})
    async def test_rag_uses_verified_customer_agency(self):
        fake = FakeGemini()
        customer = CustomerContext(organization_id=ORG, lead_id=ORG, contact_id=ORG)
        handle = identity.set(BackendIdentity('token', customer))
        try:
            with patch('app.gemini_service.genai.Client', return_value=fake), patch('app.rag.retrieve', new=AsyncMock(return_value=[])) as retrieve:
                await chat_with_tools('hours')
                retrieve.assert_awaited_once_with('What are your opening hours?', ORG)
        finally:
            identity.reset(handle)

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test', 'RAG_ENABLED': 'true', 'PROPERTY_SOURCE': 'mock'})
    async def test_rag_refuses_missing_agency(self):
        fake = FakeGemini()
        with patch('app.gemini_service.genai.Client', return_value=fake), patch('app.rag.retrieve', new=AsyncMock()) as retrieve:
            await chat_with_tools('hours')
            retrieve.assert_not_awaited()
        self.assertIn('error', fake.tool_result)
