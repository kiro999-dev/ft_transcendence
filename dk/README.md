# Start the MVP on another machine

You need Git, Docker with Compose, Make, and Python 3. Run commands from `dk`.

```sh
make setup
# Add your GEMINI_API_KEY to dk/.env if setup could not copy it from the root .env.
make up
```

`make setup` generates local secrets without overwriting existing ones.
`make up` builds the code, creates missing database tables, and starts PostgreSQL,
the backend, frontend, AI service, and WAHA. It does not delete existing data.
Schema changes that require data loss stop startup instead of accepting them.

Open the platform at http://localhost:5173 and create your agency owner account.
Add real properties and set your calendar working hours, using 30-minute slots.

Link the WhatsApp session to that agency once:

```sh
make whatsapp-link
```

Enter your owner email/password (and your email OTP if enabled). This command
uses the regular login API and saves only the session-to-agency link. It does
not store your password. Backend access tokens are then issued automatically
for incoming WhatsApp messages; you never copy a JWT manually.

Open http://localhost:3001/dashboard. The login values are
`WAHA_DASHBOARD_USERNAME` and `WAHA_DASHBOARD_PASSWORD` in `dk/.env`.
Scan the session QR with your phone: WhatsApp → Linked devices → Link a device.
Do not use the agency's own phone to test incoming messages; use another phone.
WAHA is ready to chat when the `default` session says `WORKING`.

## Customer flow

1. Customer sends a text message to the linked WhatsApp account.
2. The backend finds/creates their CRM contact and lead using their phone number.
3. Gemini answers questions, suggests real properties, and checks visit slots.
4. The customer sends `BOOK 1` to select a numbered slot.
5. The AI asks for `CONFIRM ABC123` with a code for that selection.
6. Only that explicit confirmation creates a visit. The slot is checked again first.
7. The owner sees the property, customer phone, date, and time in the calendar.

Calendar data refreshes every 15 seconds. No conversation is shown in the app.
Chat history, selections, and already-handled message IDs stay in the AI's
SQLite volume. WAHA's linked-device session stays in its own volume.

## Useful commands

```sh
make status
make logs
make down                  # Stops services; keeps data and linked device.
make up                    # Rebuilds and starts them again.
```

The AI API is at http://localhost:8000/docs and WAHA at http://localhost:3001.
Both are bound to localhost. The backend is at http://localhost:3000.

This is deliberately a small learning MVP: one agency, one WAHA session named
`default`, one AI worker, text messages, and 30-minute visits. Voice, media,
conversation dashboards, and advanced sales automation are not included.
Do not run `make fclean` unless you intend to remove the database and the linked
WhatsApp session. The external `ai_service_data` volume is kept separately.

## Tests

Before linking a real agency, you can run the integration smoke test:

```sh
docker compose exec -T ai-service python -m scripts.smoke_whatsapp
```

It creates a test agency/property, simulates Gemini and outgoing WhatsApp delivery,
and uses the real CRM, availability and booking APIs. It checks confirmation,
duplicate delivery, and the calendar property/time/phone data. It unlinks its
test agency afterward. It sends no actual WhatsApp messages. Do not run this
smoke test after linking your real agency: the default session already belongs
to you and the backend will reject the test link.

WAHA configuration follows its official docs:
https://waha.devlike.pro/docs/how-to/config/
https://waha.devlike.pro/docs/how-to/sessions/
