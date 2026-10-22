-- 1. تفعيل إكستنشن pgcrypto لإنشاء UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. جدول المنظمات (Organizations)
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" varchar(255) NOT NULL,
    "status" varchar(20) NOT NULL DEFAULT 'active',
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول المستخدمين (Users)
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid
        REFERENCES "organizations" ("id") ON DELETE CASCADE,
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
    "reset_token_expires_at" timestamptz
);

-- 4. جدول العقارات (Properties)
CREATE TABLE IF NOT EXISTS "properties" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< HEAD
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
=======
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id") ON DELETE CASCADE,
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
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

-- 5. جدول صور العقارات (Property Images)
CREATE TABLE IF NOT EXISTS "property_images" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< HEAD
    "property_id" uuid NOT NULL REFERENCES "properties" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
=======
    "property_id" uuid NOT NULL
        REFERENCES "properties" ("id") ON DELETE CASCADE,
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
    "image_url" text NOT NULL,
    "display_order" integer NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. جدول وثائق العقارات (Property Documents)
CREATE TABLE IF NOT EXISTS "property_documents" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "property_id" uuid NOT NULL REFERENCES "properties" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "content" text NOT NULL,
    "chunk_index" integer NOT NULL DEFAULT 0,
    "metadata" json,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. جدول الزوار (Visitors)
CREATE TABLE IF NOT EXISTS "visitors" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< HEAD
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
=======
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id") ON DELETE CASCADE,
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
    "name" varchar(255),
    "email" varchar(255),
    "phone" varchar(50),
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. جدول المحادثات (Conversations)
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< HEAD
    "visitor_id" uuid NOT NULL REFERENCES "visitors" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "property_id" uuid REFERENCES "properties" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
=======
    "visitor_id" uuid NOT NULL
        REFERENCES "visitors" ("id") ON DELETE CASCADE,
    "property_id" uuid
        REFERENCES "properties" ("id") ON DELETE SET NULL,
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
    "started_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. جدول الرسائل (Messages)
CREATE TABLE IF NOT EXISTS "messages" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< HEAD
    "conversation_id" uuid NOT NULL REFERENCES "conversations" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
=======
    "conversation_id" uuid NOT NULL
        REFERENCES "conversations" ("id") ON DELETE CASCADE,
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
    "sender_type" varchar(20) NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. جدول العملاء المحتملين (Leads)
CREATE TABLE IF NOT EXISTS "leads" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< HEAD
    "organization_id" uuid NOT NULL REFERENCES "organizations" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "visitor_id" uuid NOT NULL REFERENCES "visitors" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    "property_id" uuid REFERENCES "properties" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
=======
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "visitor_id" uuid NOT NULL
        REFERENCES "visitors" ("id") ON DELETE CASCADE,
    "property_id" uuid
        REFERENCES "properties" ("id") ON DELETE SET NULL,
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
    "status" varchar(50) NOT NULL DEFAULT 'new',
    "score" integer,
    "budget" decimal(14,2),
    "notes" text,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

<<<<<<< HEAD
-- 11. إعدادات الذكاء الاصطناعي (AI Settings)
CREATE TABLE IF NOT EXISTS "ai_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid UNIQUE NOT NULL REFERENCES "organizations" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
=======
CREATE TABLE IF NOT EXISTS "bookings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "lead_id" uuid
        REFERENCES "leads" ("id") ON DELETE SET NULL,
    "property_id" uuid NOT NULL
        REFERENCES "properties" ("id") ON DELETE CASCADE,
    "visitor_id" uuid NOT NULL
        REFERENCES "visitors" ("id") ON DELETE CASCADE,
    "visit_date" timestamp NOT NULL,
    "status" varchar(50) NOT NULL DEFAULT 'pending',
    "notes" text,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "calendar_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" uuid NOT NULL
        REFERENCES "organizations" ("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL
        REFERENCES "users" ("id") ON DELETE CASCADE,
    "booking_id" uuid
        REFERENCES "bookings" ("id") ON DELETE SET NULL,
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
        REFERENCES "organizations" ("id") ON DELETE CASCADE,
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
    "welcome_message" text,
    "qualification_questions" json,
    "booking_enabled" boolean NOT NULL DEFAULT true,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. جلسات واتساب (WhatsApp Sessions)
CREATE TABLE IF NOT EXISTS "whatsapp_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< HEAD
    "organization_id" uuid UNIQUE NOT NULL REFERENCES "organizations" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
=======
    "organization_id" uuid UNIQUE NOT NULL
        REFERENCES "organizations" ("id") ON DELETE CASCADE,
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
    "session_name" varchar(255) UNIQUE NOT NULL,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. أوقات توفر الوكيل (AgentAvailability)
CREATE TABLE IF NOT EXISTS "AgentAvailability" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
<<<<<<< HEAD
    "userId" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "startTime" timestamp NOT NULL,
    "endTime" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "AgentAvailability_userId_startTime_idx" ON "AgentAvailability" ("userId", "startTime");

-- 14. جدول الزيارات (Visit)
CREATE TABLE IF NOT EXISTS "Visit" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "property_id" uuid NOT NULL REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "leadId" uuid NOT NULL REFERENCES "leads" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "date_of_visit" timestamp NOT NULL,
    "status" text NOT NULL DEFAULT 'PENDING',
    "startAt" timestamp NOT NULL,
    "endAt" timestamp NOT NULL
);

-- 15. الاستثناءات في التقويم (CalendarException)
CREATE TABLE IF NOT EXISTS "CalendarException" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "startTime" timestamp NOT NULL,
    "endTime" timestamp NOT NULL,
    "reason" text
);

-- 16. تاريخ حالات الزيارة (VisitStatusHistory)
CREATE TABLE IF NOT EXISTS "VisitStatusHistory" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "visitId" uuid NOT NULL REFERENCES "Visit" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "status" text NOT NULL,
    "changedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
=======
    "property_id" uuid NOT NULL
        REFERENCES "properties" ("id") ON DELETE CASCADE,
    "content" text NOT NULL,
    "chunk_index" integer NOT NULL DEFAULT 0,
    "metadata" json,
    "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
>>>>>>> 275b0b7e87c3064bce689961dcf60275d2d560d6
);