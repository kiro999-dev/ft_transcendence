"""Simple local storage for AI-owned conversations, using SQLite."""
import os
import sqlite3
import uuid
from pathlib import Path


def connect():
    path = Path(os.getenv('AI_DATABASE_PATH', 'data/conversations.db'))
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path)
    db.execute('PRAGMA foreign_keys = ON')
    db.execute('CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
    db.execute('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id TEXT NOT NULL REFERENCES conversations(id), role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)')
    return db


def create_conversation():
    conversation_id = str(uuid.uuid4())
    with connect() as db:
        db.execute('INSERT INTO conversations (id) VALUES (?)', (conversation_id,))
    return conversation_id


def get_messages(conversation_id):
    with connect() as db:
        if not db.execute('SELECT 1 FROM conversations WHERE id = ?', (conversation_id,)).fetchone():
            return None
        rows = db.execute('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id', (conversation_id,)).fetchall()
    return [{'role': role, 'content': content} for role, content in rows]


def save_exchange(conversation_id, message, reply):
    with connect() as db:
        db.executemany('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
                       [(conversation_id, 'user', message), (conversation_id, 'assistant', reply)])


def whatsapp_conversation(session, phone):
    with connect() as db:
        db.execute('CREATE TABLE IF NOT EXISTS whatsapp_chats (session TEXT NOT NULL, phone TEXT NOT NULL, conversation_id TEXT NOT NULL, PRIMARY KEY (session, phone))')
        row = db.execute('SELECT conversation_id FROM whatsapp_chats WHERE session = ? AND phone = ?', (session, phone)).fetchone()
        if row:
            return row[0]
        conversation_id = str(uuid.uuid4())
        db.execute('INSERT INTO conversations (id) VALUES (?)', (conversation_id,))
        db.execute('INSERT INTO whatsapp_chats (session, phone, conversation_id) VALUES (?, ?, ?)', (session, phone, conversation_id))
        return conversation_id
