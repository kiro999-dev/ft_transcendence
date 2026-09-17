CREATE TABLE IF NOT EXISTS "organizations" (
    "id" uuid PRIMARY KEY,
    "name" varchar(255) NOT NULL,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    "deleted_at" timestamp 
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE,
    "name" varchar(255) NOT NULL,
    "email" varchar(255) UNIQUE NOT NULL,
    "password_hash" text NOT NULL,
    "phone" varchar(50),
    "role" varchar(20) NOT NULL DEFAULT 'owner',
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    "deleted_at" timestamp 
);

CREATE TABLE IF NOT EXISTS "properties" (
    "id" uuid PRIMARY KEY,
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE,
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
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    "deleted_at" timestamp 
  
);

CREATE TABLE IF NOT EXISTS "property_images" (
  "id" uuid PRIMARY KEY,
  "property_id" uuid NOT NULL REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "image_url" text NOT NULL,
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "visitors" (
  "id" uuid PRIMARY KEY,
  "name" varchar(255),
  "email" varchar(255),
  "phone" varchar(50),
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" uuid PRIMARY KEY,
  "visitor_id" uuid NOT NULL REFERENCES "visitors" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "property_id" uuid REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "started_at" timestamp NOT NULL,
  "last_message_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" uuid PRIMARY KEY,
  "conversation_id" uuid NOT NULL REFERENCES "conversations" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "sender_type" varchar(20) NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "leads" (
  "id" uuid PRIMARY KEY,
  "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "visitor_id" uuid NOT NULL REFERENCES "visitors" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "property_id" uuid REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "status" varchar(50) NOT NULL DEFAULT 'new',
  "score" integer,
  "budget" decimal(14,2),
  "notes" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "bookings" (
  "id" uuid PRIMARY KEY,
  "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "lead_id" uuid REFERENCES "leads" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "property_id" uuid NOT NULL REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "visitor_id" uuid NOT NULL REFERENCES "visitors" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "visit_date" timestamp NOT NULL,
  "status" varchar(50) NOT NULL DEFAULT 'pending',
  "notes" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "calendar_events" (
  "id" uuid PRIMARY KEY,
  "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "user_id" uuid NOT NULL REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "booking_id" uuid REFERENCES "bookings" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "ai_settings" (
  "id" uuid PRIMARY KEY,
  "organization_id" uuid UNIQUE NOT NULL REFERENCES "organizations" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "welcome_message" text,
  "qualification_questions" json,
  "booking_enabled" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "property_documents" (
  "id" uuid PRIMARY KEY,
  "property_id" uuid NOT NULL REFERENCES "properties" ("id") DEFERRABLE INITIALLY IMMEDIATE,
  "content" text NOT NULL,
  "chunk_index" integer NOT NULL DEFAULT 0,
  "metadata" json,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);