-- Migration signalée — NE PAS lancer sans accord Kono
-- Commande : npx prisma migrate dev --name landing_support_phone

ALTER TABLE "landing_support_conversations"
  ADD COLUMN IF NOT EXISTS "visitor_phone" TEXT;
