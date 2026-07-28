ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_verified_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users"("phone");

CREATE TABLE IF NOT EXISTS "sms_otp_tokens" (
  "id" UUID NOT NULL,
  "phone" TEXT NOT NULL,
  "code_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "verify_attempts" INTEGER NOT NULL DEFAULT 0,
  "ip_address" TEXT NOT NULL,
  "consumed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "sms_otp_tokens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sms_otp_tokens_phone_created_at_idx" ON "sms_otp_tokens"("phone", "created_at");
CREATE INDEX IF NOT EXISTS "sms_otp_tokens_ip_address_created_at_idx" ON "sms_otp_tokens"("ip_address", "created_at");