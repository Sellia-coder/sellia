-- Migration signalée — NE PAS lancer sans accord Kono
-- Commande : npx prisma migrate dev --name chat_receipts

ALTER TABLE "chat_messages"
  ADD COLUMN IF NOT EXISTS "delivered_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP(3);
