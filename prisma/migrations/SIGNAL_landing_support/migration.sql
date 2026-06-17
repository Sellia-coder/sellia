-- Migration signalée — NE PAS lancer sans accord Kono
-- Commande : npx prisma migrate dev --name landing_support

CREATE TYPE "LandingSupportStatus" AS ENUM ('NEW', 'REPLIED', 'CLOSED');
CREATE TYPE "LandingSupportSender" AS ENUM ('VISITOR', 'ADMIN');

CREATE TABLE "landing_support_conversations" (
    "id" TEXT NOT NULL,
    "visitor_token" TEXT NOT NULL,
    "visitor_name" TEXT,
    "visitor_email" TEXT,
    "status" "LandingSupportStatus" NOT NULL DEFAULT 'NEW',
    "unread_for_admin" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_preview" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_support_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "landing_support_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender" "LandingSupportSender" NOT NULL,
    "content" TEXT NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "blocked_reason" TEXT,
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_support_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "landing_support_conversations_visitor_token_key" ON "landing_support_conversations"("visitor_token");
CREATE INDEX "landing_support_conversations_status_last_message_at_idx" ON "landing_support_conversations"("status", "last_message_at");
CREATE INDEX "landing_support_conversations_unread_for_admin_idx" ON "landing_support_conversations"("unread_for_admin");
CREATE INDEX "landing_support_messages_conversation_id_created_at_idx" ON "landing_support_messages"("conversation_id", "created_at");

ALTER TABLE "landing_support_messages" ADD CONSTRAINT "landing_support_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "landing_support_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
