"""Save offered slots and webhook replies in the AI service's existing SQLite file."""
import json
from app.conversations import connect


def setup(db):
    db.execute('CREATE TABLE IF NOT EXISTS whatsapp_slots (conversation_id TEXT PRIMARY KEY, slots TEXT NOT NULL, selected INTEGER, code TEXT)')
    db.execute('CREATE TABLE IF NOT EXISTS whatsapp_replies (message_id TEXT PRIMARY KEY, reply TEXT NOT NULL, sent INTEGER NOT NULL DEFAULT 0)')


def save_slots(conversation_id, slots, selected=None, code=None):
    with connect() as db:
        setup(db)
        db.execute('INSERT OR REPLACE INTO whatsapp_slots VALUES (?, ?, ?, ?)',
                   (conversation_id, json.dumps(slots), selected, code))


def get_slots(conversation_id):
    with connect() as db:
        setup(db)
        row = db.execute('SELECT slots, selected, code FROM whatsapp_slots WHERE conversation_id = ?', (conversation_id,)).fetchone()
    return (json.loads(row[0]), row[1], row[2]) if row else ([], None, None)


def get_reply(message_id):
    with connect() as db:
        setup(db)
        return db.execute('SELECT reply, sent FROM whatsapp_replies WHERE message_id = ?', (message_id,)).fetchone()


def save_reply(message_id, reply, sent=False):
    with connect() as db:
        setup(db)
        db.execute('INSERT OR REPLACE INTO whatsapp_replies VALUES (?, ?, ?)', (message_id, reply, int(sent)))
