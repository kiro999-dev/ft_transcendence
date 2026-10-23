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

