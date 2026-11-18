-- Apply this only to the AI service's own PostgreSQL database.
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS ai_document_chunks (
    id BIGSERIAL PRIMARY KEY,
    document_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    title TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS ai_chunks_organization_idx ON ai_document_chunks (organization_id);
