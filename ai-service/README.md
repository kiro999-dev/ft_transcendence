# AI service: learning MVP

The goal: answer real estate questions on WhatsApp, suggest properties, book a
confirmed visit, and show its property/time/customer phone in the owner calendar.

Start everything with the instructions in [dk/README.md](../dk/README.md).
You do not need to run the AI Makefile separately when using the full Docker stack.

## Read the code in this order

1. `app/prompt.py`: the short sales prompt shared by chat and streaming.
2. `app/property_client.py`: translates Gemini search filters to `GET /properties`.
3. `app/booking_client.py`: calls backend availability and visit creation.
4. `app/gemini_service.py`: gives Gemini three tools: property search, availability,
   and optional agency knowledge. It returns both text and actual tool results.
5. `app/whatsapp.py`: receives a verified WAHA message, gets the customer identity,
   chats, shows numbered slots, and handles `BOOK` / `CONFIRM` commands.
6. `app/booking_confirmation.py`: checks the selected property and slot again,
   then sends a visit request with the customer's real CRM IDs.
7. `app/conversations.py` and `app/whatsapp_state.py`: small SQLite helpers for
   history, selected slots, and avoiding repeated replies/bookings on delivery retries.
8. `app/backend_context.py`: keeps the backend token and customer IDs separate
   for each request. They are not included in the model prompt.
9. `app/main.py`: FastAPI routes; `app/models.py`: their request/response shapes.

The small backend integration is in
`apps/backend/src/whatsapp-integration/whatsapp-integration.controller.ts`:

- `POST /internal/ai/whatsapp/link`: owner login required; links session to agency once.
- `POST /internal/ai/whatsapp/context`: private gateway credential required;
  finds/creates the sender's contact/lead and returns a short-lived backend JWT.
- `DELETE /internal/ai/whatsapp/link`: owner can remove their agency's link.

The normal chat flow is:

```text
WhatsApp → webhook → CRM identity → Gemini → property/availability tools → WhatsApp reply
BOOK number → save selection → CONFIRM code → booking API → calendar
```

The customer never provides a JWT or internal CRM/property UUID. The owner never
sees the conversation in the platform; they see the visit in their calendar.
The calendar API joins the visit to its property and CRM contact to include phone.

## Other existing endpoints

`GET /health`, `POST /chat`, `POST /chat/stream`, and saved conversation routes
remain available. Backend-mode chat requires `Authorization: Bearer <AI_API_TOKEN>`.
A trusted gateway can send `X-Backend-Token` and a `context` object containing
`organization_id`, `lead_id`, and `contact_id`. A structured `booking_confirmation`
contains the selected `property_id`, `agent_id`, `starts_at`, and
`confirmed_by_customer: true`. The separate `/bookings` endpoint accepts those
confirmation fields plus `context` at the top level.

These routes are for application integration. WhatsApp customers use only messages
and the confirmation commands above. Confirmed booking errors are not automatically
retried; an uncertain response means checking the calendar before trying again.

`PROPERTY_SOURCE=mock` and `app/mock_backend.py` are local demos. Compose uses
`PROPERTY_SOURCE=backend`. The booking confirmation currently supports 30-minute
slots. Use valid future dates and configured agent working hours.

Optional existing RAG files (`rag.py`, `rag_routes.py`, `compose.rag.yml`) are not
needed for this MVP; `RAG_ENABLED` is off by default. Without agency documents,
the assistant must not invent agency policy answers.

## Tests

```sh
# From dk, after the stack starts:
docker compose exec -T ai-service python -m unittest discover -s tests -q
```

Tests simulate the model and WhatsApp sends. The separate
`scripts/smoke_whatsapp.py` checks the real backend integration without sending
messages to a phone. A real WhatsApp conversation still needs QR pairing and a
working Gemini API key.
