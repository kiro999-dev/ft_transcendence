import asyncio
import logging
import os

from google import genai
from google.genai import types

from app.models import ChatResult
from app.booking_client import get_availability as fetch_availability
from app.property_mock import search_properties as search_mock_properties

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """An error we can explain to the chat user without exposing secrets."""


async def chat_with_tools(message: str) -> ChatResult:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise AIServiceError("GEMINI_API_KEY is missing from the AI service environment.")

    # This dictionary belongs to one request, so users do not share results.
    properties = {}
    availability = []
    tool_errors = []

    def search_properties(
        city: str | None = None,
        property_type: str | None = None,
        max_price: int | None = None,
        bedrooms: int | None = None,
    ) -> dict:
        """Search the demo catalog by city, type, maximum price and minimum bedrooms."""
        result = search_mock_properties(city, property_type, max_price, bedrooms)
        for property_data in result["properties"]:
            properties[property_data["id"]] = property_data
        logger.info("Property search returned %s results", result["count"])
        return result

    async def get_availability(property_id: str, preferred_date: str) -> dict:
        """Check visit slots for a real property UUID and a YYYY-MM-DD date."""
        result = await fetch_availability(property_id, preferred_date)
        if "error" in result:
            tool_errors.append(result["error"])
            logger.warning("Booking availability lookup failed")
        else:
            availability.append(result)
            logger.info("Availability returned %s slots", len(result["slots"]))
        return result

    try:
        # Close the HTTP connection after the request. Timeout is in milliseconds.
        async with genai.Client(
            api_key=api_key, http_options=types.HttpOptions(timeout=30000)
        ).aio as client:
            response = await asyncio.wait_for(
                client.models.generate_content(
                    model=os.getenv("GEMINI_MODEL", "gemini-flash-latest"),
                    contents=message,
                    config=types.GenerateContentConfig(
                        system_instruction="""
You are the AI assistant of a real estate agency, currently using a DEMO catalog.
For property searches, use search_properties. Only describe returned properties.
Never invent properties, prices, availability or bookings.
Tell the customer these are demo listings, not the agency's live inventory.
If no properties match, say no matching property was found.
For visit times, use get_availability with a real property UUID and an explicit date.
Ask for missing information. Demo IDs such as prop-1 cannot be used for bookings.
Only show slots returned by the backend. An error is not an empty availability list.
Visit creation is not connected: never claim to book, reserve or confirm a visit.
Explain that a human agent must confirm any selected slot.
Keep the response short and clear.
""",
                        tools=[search_properties, get_availability],
                        automatic_function_calling=types.AutomaticFunctionCallingConfig(
                            maximum_remote_calls=3
                        ),
                    ),
                ),
                timeout=60,
            )
    except Exception as error:
        # Log only the error type: provider messages can contain request data.
        logger.warning("Gemini request failed: %s", type(error).__name__)
        raise AIServiceError("The AI service is temporarily unavailable. Please try again.") from error

    if not response.text or response.function_calls:
        logger.warning("Gemini did not finish its text answer")
        raise AIServiceError("The AI could not finish its answer. Please try again.")

    return ChatResult(
        reply=response.text,
        properties=list(properties.values()),
        availability=availability,
        tool_errors=tool_errors,
    )
