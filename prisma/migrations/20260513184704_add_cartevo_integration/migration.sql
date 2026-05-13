-- CreateEnum
CREATE TYPE "CartevoTxType" AS ENUM ('COLLECT', 'PAYOUT');

-- CreateEnum
CREATE TYPE "CartevoTxStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "cartevo_transactions" (
    "id" TEXT NOT NULL,
    "cartevo_tx_id" TEXT NOT NULL,
    "cartevo_external_id" TEXT,
    "type" "CartevoTxType" NOT NULL,
    "status" "CartevoTxStatus" NOT NULL DEFAULT 'INITIATED',
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "fee_cartevo" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "fee_sellia" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(14,2) NOT NULL,
    "operator" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "shop_id" TEXT,
    "order_id" TEXT,
    "payout_id" TEXT,
    "error_message" TEXT,
    "raw_request" JSONB,
    "raw_response" JSONB,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cartevo_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "fee_cartevo" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'XAF',
    "operator" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartevo_webhook_logs" (
    "id" TEXT NOT NULL,
    "webhook_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "cartevo_tx_id" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "raw_headers" JSONB NOT NULL,
    "raw_body" JSONB NOT NULL,
    "signature_valid" BOOLEAN NOT NULL DEFAULT false,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cartevo_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cartevo_transactions_cartevo_tx_id_key" ON "cartevo_transactions"("cartevo_tx_id");

-- CreateIndex
CREATE UNIQUE INDEX "cartevo_transactions_order_id_key" ON "cartevo_transactions"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "cartevo_transactions_payout_id_key" ON "cartevo_transactions"("payout_id");

-- CreateIndex
CREATE INDEX "cartevo_transactions_shop_id_type_status_idx" ON "cartevo_transactions"("shop_id", "type", "status");

-- CreateIndex
CREATE INDEX "cartevo_transactions_cartevo_tx_id_idx" ON "cartevo_transactions"("cartevo_tx_id");

-- CreateIndex
CREATE INDEX "cartevo_transactions_created_at_idx" ON "cartevo_transactions"("created_at");

-- CreateIndex
CREATE INDEX "payouts_shop_id_status_idx" ON "payouts"("shop_id", "status");

-- CreateIndex
CREATE INDEX "payouts_created_at_idx" ON "payouts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "cartevo_webhook_logs_webhook_id_key" ON "cartevo_webhook_logs"("webhook_id");

-- CreateIndex
CREATE INDEX "cartevo_webhook_logs_cartevo_tx_id_idx" ON "cartevo_webhook_logs"("cartevo_tx_id");

-- CreateIndex
CREATE INDEX "cartevo_webhook_logs_received_at_idx" ON "cartevo_webhook_logs"("received_at");

-- AddForeignKey
ALTER TABLE "cartevo_transactions" ADD CONSTRAINT "cartevo_transactions_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartevo_transactions" ADD CONSTRAINT "cartevo_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartevo_transactions" ADD CONSTRAINT "cartevo_transactions_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
