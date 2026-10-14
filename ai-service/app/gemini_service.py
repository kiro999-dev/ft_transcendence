import os

from google import genai
from google.genai import types

from app.property_mock import search_properties


api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing")


client = genai.Client(api_key=api_key)


async def chat_with_tools(message: str) -> str:
    response = await client.aio.models.generate_content(
        model="gemini-flash-latest",
        contents=message,
        config=types.GenerateContentConfig(
            system_instruction="""
You are the AI assistant of a real estate agency.

Rules:

- If the customer asks to find, search, recommend, or show properties,
  use the search_properties tool.

- Never invent properties.

- Never invent property prices.

- Never invent availability.

- Only recommend properties returned by search_properties.

- If no properties match, tell the customer that no matching
  property was found.

- Keep the response concise and professional.
""",
            tools=[search_properties],
        ),
    )

    return response.text