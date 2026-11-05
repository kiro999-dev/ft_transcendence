import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch
from google.genai import types
from app.models import ChatRequest
from app.stream_chat import stream_chat


class FakeClient:
    def __init__(self, **kwargs):
        self.aio = self
        self.models = self
        self.calls = 0

    async def __aenter__(self): return self
    async def __aexit__(self, *args): pass

    async def generate_content_stream(self, **kwargs):
        self.calls += 1
        async def chunks():
            if self.calls == 1:
                part = types.Part(function_call=types.FunctionCall(name='search_properties', args={'city': 'marrakech'}))
            else:
                part = types.Part.from_text(text='Here is a demo listing.')
            yield SimpleNamespace(candidates=[SimpleNamespace(content=types.Content(role='model', parts=[part]))])
        return chunks()


class StreamTests(unittest.IsolatedAsyncioTestCase):
    @patch.dict(os.environ, {}, clear=True)
    async def test_missing_key(self):
        chunks = [chunk async for chunk in stream_chat(ChatRequest(message='Hello'))]
        self.assertIn('event: error', chunks[0])

    @patch.dict(os.environ, {'GEMINI_API_KEY': 'test', 'PROPERTY_SOURCE': 'mock'})
    @patch('app.stream_chat.genai.Client', FakeClient)
    async def test_property_tool_then_streamed_text(self):
        chunks = [chunk async for chunk in stream_chat(ChatRequest(message='Find a villa'))]
        self.assertIn('event: tool', chunks[0])
        self.assertIn('prop-1', chunks[0])
        self.assertIn('event: text', chunks[1])
        self.assertIn('event: done', chunks[2])
