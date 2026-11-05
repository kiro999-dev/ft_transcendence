# AI service — Phase 1 and booking availability

This service uses a **demo property catalog**. Main currently has a booking
availability endpoint, but no property search/detail or visit creation endpoint.
A successful demo search does not mean the live agency catalog is connected.

## Run locally

### Using Docker

Put `GEMINI_API_KEY` in the project-root `.env`. From `ai-service`, run:

```sh
make build
make run
```

Open `http://localhost:8000/docs`. The Makefile loads `../.env` and connects to
the backend on your computer at port 3000 through `host.docker.internal`.
Restart the container after changing `.env`; rebuild after changing Python code.
For a different backend address, use `make run BACKEND_URL=http://your-host:3000`.

The backend and database must also run for availability checks. From the project
root, `docker compose up -d postgres` starts PostgreSQL. The backend's documented
dependency manager is Bun; after installing dependencies and generating its
Prisma client, it builds with `npm run build` from `apps/backend`. Start that
build from `apps/backend` with `node --env-file=../../.env dist/main.js`.

The current Docker database initialization does not create the booking tables
in the Prisma schema (`AgentAvailability`, `CalendarException`, `Visit`, and
`VisitStatusHistory`). Ask the booking owner for their schema setup/migration and
test property/agent data before expecting a successful availability lookup.

### Without Docker

From `ai-service`:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
export GEMINI_API_KEY='your-key'
.venv/bin/uvicorn app.main:app --reload
```

Optionally set `GEMINI_MODEL`; the default is `gemini-flash-latest`.
`GET /health` checks that FastAPI is running, not whether Gemini is reachable.
Use `http://localhost:8000/docs` to try `POST /chat`.

Request:

```json
{"message": "Show villas in Marrakech under 2000000 MAD"}
```

The response keeps `message_received` and `reply`, and adds `properties` and
`property_source: "mock"`. `properties` contains the actual records returned by
search tools during that request, not JSON invented by the model. It can include
results from several searches. An ordinary greeting or an empty search returns
an empty list.

## How the code works

1. `main.py` receives and validates the message.
2. `gemini_service.py` sends it to Gemini with a Python search function as a tool.
3. Gemini can call that function; it searches `property_mock.py`.
4. The function saves the returned properties in a dictionary for this request.
5. Gemini writes the reply, and FastAPI returns the reply plus those properties.

The nested search function lets each request keep its own results. Its dictionary
uses property IDs as keys so repeated searches do not create duplicate cards.
The Google SDK handles calling the function and sending its result back to the
model: https://googleapis.github.io/python-genai/#function-calling

Blank/oversized messages return 422. Missing configuration, provider failures,
timeouts or unfinished model answers return 503. Logs record counts and error
types without logging chat text, keys or full provider error messages.

## Tests

```sh
.venv/bin/python -m unittest discover -s tests -v
```

Tests substitute Gemini to avoid spending API credits. A real Gemini call and
live backend integration still need to be tested with configured services.

## Findings for teammates (their code was not edited)

At main commit `6eaaa20`:

- Only `POST /internal/ai/availability` exists for the AI integration. Property
  search/details and `POST /internal/ai/visits` from the PDF are missing.
- The booking controller has no authentication/organization guard, and no global
  guard is registered. The service finds the property by its ID alone.
- The booking service accepts `timezone` but builds UTC day boundaries instead.
- Conflict queries only fetch records starting that day. A visit or exception
  starting the previous day and overlapping today's availability can be missed.
- The service picks the organization's first owner as the agent; confirm whether
  this is the intended assignment rule.

## Phase 4: booking integration status

`booking_client.py` calls the real `POST /internal/ai/availability` endpoint via
HTTPX. Gemini can use it when the customer supplies a real property UUID and an
explicit date. Mock IDs such as `prop-1` are rejected before making a request.
The chat response includes `availability` (backend results) and `tool_errors`
(failed lookups). Empty slots mean no availability; errors mean we could not check.

Set `BACKEND_URL` to the backend address (default `http://localhost:3000`). In
Docker, localhost means the AI container itself: use the reachable backend host.
Optional `AI_SERVICE_TOKEN` and `AI_ORGANIZATION_ID` are forwarded as the contract
headers. The current backend does not enforce them yet; its owner must add that
before exposing this integration to multiple agencies.

Try a chat message like: `Check visits for property <real UUID> on 2026-11-01`.
Start the backend with its database and actual agent availability records first.

**Phase 4 is incomplete:** visit creation, conflict handling on reservation, and
confirmed bookings need the missing `POST /internal/ai/visits` endpoint. CRM lead
and contact IDs also need their owner's integration. No booking creation tool is
exposed yet, and the assistant is told to refer confirmation to a human agent.
The timezone and conflict findings above also need fixes by the booking owner.


## Preparing real property search

The default `PROPERTY_SOURCE=mock` keeps the demo catalog. The new
`app/property_client.py` prepares the contract's
`POST /internal/ai/properties/search`. Once your teammate provides that endpoint
and trusted service credentials, set `PROPERTY_SOURCE=backend`, `BACKEND_URL`,
`AI_SERVICE_TOKEN`, and `AI_ORGANIZATION_ID` in the server environment.
The current `main` has authenticated `GET /properties` routes instead; they do
not yet match the agreed search contract. Backend mode reports an error if the
contract endpoint is unavailable and never silently substitutes demo listings.
Booking creation is not implemented: the teammate's visit endpoint and trusted
customer identity flow are still needed before it can safely be connected.

## Conversation history

`POST /chat` accepts an optional `history` list. The caller sends earlier
messages in order, for example:

```json
{"message":"Marrakech", "history":[
  {"role":"user", "content":"I want a villa"},
  {"role":"assistant", "content":"Which city?"}
]}
```

The AI service sends those messages to Gemini before the new message. It does
not save them: the caller must keep and resend them. A request can include up to
20 previous messages. Only pass history belonging to the current conversation.
This is not persistent conversation storage. `/chat` waits for the complete
answer; `/chat/stream` streams Gemini text and tool results as described below.

## Message analysis

`POST /analyze` accepts `{"message": "I am frustrated"}` and asks Gemini for
positive/neutral/negative sentiment, short reasons, and an inappropriate-content
flag. This is a separate endpoint: it does not automatically moderate `/chat`,
store results, or send them to CRM. The result is an estimate for an agent to
review, not a final decision. Gemini errors return 503.

## Streaming chat

`POST /chat/stream` accepts the same JSON as `/chat` and returns server-sent
events. `text` events contain pieces of the answer, `tool` events contain
property or availability results, `done` marks success, and `error` reports a
failure. A stream can fail after the HTTP response has started, so clients must
read the events and not rely only on the HTTP status.

Example from another terminal:

```sh
curl -N http://localhost:8000/chat/stream \
  -H 'Content-Type: application/json' \
  -d '{"message":"Show villas in Marrakech"}'
```

This endpoint and `/chat` both accept caller-supplied history; neither stores it.
Streaming uses the same mock or backend property setting and does not create
bookings. The frontend must collect text chunks and display tool results.

## Backend features and setup

These features are in development and use a **single configured agency**.
They are not yet a finished multi-tenant deployment. Do not expose them publicly
until authentication, tenant isolation, and webhook retries are agreed with the
team and tested. All commands below are run from `ai-service`.

### Saved conversations

Set `AI_API_TOKEN` to a private value in the project-root `.env`. Send it as
`Authorization: Bearer <AI_API_TOKEN>` to:

- `POST /conversations` creates a conversation and returns its ID.
- `GET /conversations/{id}` returns its saved messages.
- `POST /conversations/{id}/messages` accepts `{"message":"Hello"}` and saves
  the message and successful reply. The last 20 messages are sent to Gemini.

The simple SQLite database belongs to the AI service. Docker's `make run` keeps
it in the `ai_service_data` volume at `/app/data`; outside Docker it lives in
`data/conversations.db` unless `AI_DATABASE_PATH` is set. Back up the volume if
needed. The shared token protects all conversations equally; it does not yet
provide per-user/agency authorization. Concurrent messages to one conversation
are not serialized, so send them one at a time.

Chat, streaming, analysis, knowledge and conversation requests have a simple
per-process limit (default 30 per minute per client IP). Change it with
`AI_REQUESTS_PER_MINUTE`. It is for development: multiple workers have separate
counters and a proxy may make all users share an IP.

### Local property and booking mock

Start the demo backend in a separate terminal:

```sh
.venv/bin/uvicorn app.mock_backend:app --host 0.0.0.0 --port 3001
```

This is in-memory test data, not a real property or appointment. It resets when
restarted. To use its search from the AI container, put these development values
in the root `.env`:

```text
PROPERTY_SOURCE=backend
AI_SERVICE_TOKEN=demo-token
AI_ORGANIZATION_ID=demo-agency
BOOKING_ENABLED=true
```

Run `make run BACKEND_URL=http://host.docker.internal:3001`. The mock property ID
is `11111111-1111-4111-8111-111111111111`, agent ID is
`22222222-2222-4222-8222-222222222222`, and its demo slot is
`2026-11-10T10:00:00+01:00`. Use valid UUIDs for test lead and contact IDs.
The authenticated `POST /bookings` accepts those IDs, `starts_at`, and
`confirmed_by_customer: true`. A successful response says `status: demo`; it
is not a real booking. The customer must explicitly choose and confirm the
slot before this endpoint is called. The chatbot itself does not create visits.

For the real backend, leave `BOOKING_ENABLED` off until the booking owner agrees
on authentication and confirms their endpoint. If a booking request times out,
check with the agency before retrying: the booking may have been created.

### RAG: agency knowledge

RAG uses a separate AI-owned PostgreSQL database with pgvector, not another
service's tables. Put a development `AI_RAG_PASSWORD` in the root `.env`, then:

```sh
docker compose --env-file ../.env -f compose.rag.yml up -d
```

For the AI container, set `AI_RAG_DATABASE_URL` in `.env` to
`postgresql://ai_user:<password>@host.docker.internal:55432/ai_knowledge`,
set `RAG_ENABLED=true`, and restart with `make run`. The database creates its
schema on first initialization. For an existing AI database, apply
`database/rag.sql` with an appropriate database administrator; do not apply it
to a teammate's database. PostgreSQL access is limited to localhost by the
example compose configuration.

With the AI token, `POST /knowledge/documents` accepts a JSON `title` and `text`
(up to 50,000 characters). The service splits the text, embeds it with Gemini,
and saves the chunks in pgvector. `POST /knowledge/ask` accepts a `question` and
returns an answer and source chunks. `/chat` and `/chat/stream` can also call
the knowledge tool when `RAG_ENABLED=true`. Only upload trusted agency
information: this basic version accepts text and does not provide a document
management UI or tenant-level filtering.

### WhatsApp text and voice

Set `WAHA_URL`, `WAHA_API_KEY`, `WAHA_SESSION`, and `WAHA_WEBHOOK_SECRET` in the
server environment. Configure the WAHA `message` webhook to send requests to
`/whatsapp/webhook` with the custom `X-Webhook-Secret` header. Configure WAHA to
make its downloaded media accessible on the exact `WAHA_URL` origin. The AI
accepts only that session and direct messages; it ignores outgoing messages and
other events. It downloads supported audio from that same origin (up to 10 MB),
asks Gemini to transcribe it, and sends a text reply. Inappropriate messages
receive a warning. It stores text conversation history in the AI SQLite store.

The webhook must be tested with the team's actual WAHA version and network
configuration. It does not yet deduplicate webhook retries or guarantee message
ordering; a timeout after sending can cause duplicate replies if WAHA retries.
Sentiment is calculated but is not persisted to CRM. No QR/settings UI is
included. Gemini and WAHA availability are required for real voice testing.
