-- Migration: review_merchant_reply
-- À appliquer après accord : npx prisma migrate dev --name review_merchant_reply

ALTER TABLE "Review"
  ADD COLUMN IF NOT EXISTS "merchant_reply" TEXT,
  ADD COLUMN IF NOT EXISTS "merchant_replied_at" TIMESTAMP(3);
