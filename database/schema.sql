CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "organizations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar(255) NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'active',
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid
        REFERENCES "organizations" ("id"),
    "first_name" varchar(255) NOT NULL,
    "last_name" varchar(255) NOT NULL,
    "email" varchar(255) UNIQUE NOT NULL,
    "password_hash" text NOT NULL,
    "token_hash" text,
    "phone" varchar(50),
    "role" varchar(20) NOT NULL DEFAULT 'owner',
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reset_token" text,
    "reset_token_expires_at" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "properties" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id"),
    "title" varchar(255) NOT NULL,
    "description" text,
    "property_type" varchar(50) NOT NULL,
    "listing_type" varchar(50) NOT NULL,
    "price" decimal(14,2) NOT NULL,
    "country" varchar(100) NOT NULL,
    "city" varchar(100) NOT NULL,
    "address" text,
    "bedrooms" integer,
    "bathrooms" integer,
    "area" decimal(10,2),
    "status" varchar(50) NOT NULL DEFAULT 'available',
    "metadata" json,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "property_images" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "property_id" uuid NOT NULL
        REFERENCES "properties" ("id"),
    "image_url" text NOT NULL,
    "display_order" integer NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "visitors" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id"),
    "name" varchar(255),
    "email" varchar(255),
    "phone" varchar(50),
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "conversations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "visitor_id" uuid NOT NULL
        REFERENCES "visitors" ("id"),
    "property_id" uuid
        REFERENCES "properties" ("id"),
    "started_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "messages" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversation_id" uuid NOT NULL
        REFERENCES "conversations" ("id"),
    "sender_type" varchar(20) NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "leads" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id"),
    "visitor_id" uuid NOT NULL
        REFERENCES "visitors" ("id"),
    "property_id" uuid
        REFERENCES "properties" ("id"),
    "status" varchar(50) NOT NULL DEFAULT 'new',
    "score" integer,
    "budget" decimal(14,2),
    "notes" text,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "bookings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id"),
    "lead_id" uuid
        REFERENCES "leads" ("id"),
    "property_id" uuid NOT NULL
        REFERENCES "properties" ("id"),
    "visitor_id" uuid NOT NULL
        REFERENCES "visitors" ("id"),
    "visit_date" timestamp NOT NULL,
    "status" varchar(50) NOT NULL DEFAULT 'pending',
    "notes" text,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "calendar_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id"),
    "user_id" uuid NOT NULL
        REFERENCES "users" ("id"),
    "booking_id" uuid
        REFERENCES "bookings" ("id"),
    "title" varchar(255) NOT NULL,
    "description" text,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ai_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid UNIQUE NOT NULL
        REFERENCES "organizations" ("id"),
    "welcome_message" text,
    "qualification_questions" json,
    "booking_enabled" boolean NOT NULL DEFAULT true,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "whatsapp_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid UNIQUE NOT NULL
        REFERENCES "organizations" ("id"),
    "session_name" varchar(255) UNIQUE NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "property_documents" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "property_id" uuid NOT NULL
        REFERENCES "properties" ("id"),
    "content" text NOT NULL,
    "chunk_index" integer NOT NULL DEFAULT 0,
    "metadata" json,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);