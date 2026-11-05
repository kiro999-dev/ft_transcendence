-- Changes that came from main (2FA / OTP on users + relation tweaks)

-- DropForeignKey
ALTER TABLE "property_documents" DROP CONSTRAINT "property_documents_property_id_fkey";
ALTER TABLE "property_images" DROP CONSTRAINT "property_images_property_id_fkey";
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_fkey";
ALTER TABLE "visitors" DROP CONSTRAINT "visitors_organization_id_fkey";
ALTER TABLE "whatsapp_sessions" DROP CONSTRAINT "whatsapp_sessions_organization_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "otp_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otp_expires_at" TIMESTAMPTZ(6),
ADD COLUMN     "otp_hash" TEXT,
ADD COLUMN     "otp_last_sent_at" TIMESTAMPTZ(6),
ADD COLUMN     "two_fa" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
