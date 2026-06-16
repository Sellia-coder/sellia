-- Migration: money_settings_overrides
-- À appliquer après accord : npx prisma migrate dev --name money_settings_overrides

ALTER TABLE "platform_settings"
  ADD COLUMN IF NOT EXISTS "commission_rate_free" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "commission_rate_pro" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "commission_rate_business" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "withdrawal_validation_threshold" INTEGER,
  ADD COLUMN IF NOT EXISTS "cod_unlock_price" INTEGER;
