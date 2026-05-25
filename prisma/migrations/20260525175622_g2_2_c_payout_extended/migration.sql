/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `payouts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PayoutType" AS ENUM ('ORDER_DIGITAL', 'ORDER_PHYSICAL', 'ORDER_SERVICE', 'MERCHANT_REQUESTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PayoutStatus" ADD VALUE 'PENDING_ESCROW';
ALTER TYPE "PayoutStatus" ADD VALUE 'AVAILABLE';
ALTER TYPE "PayoutStatus" ADD VALUE 'REQUESTED';
ALTER TYPE "PayoutStatus" ADD VALUE 'PAID';
ALTER TYPE "PayoutStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "payout_country" TEXT,
ADD COLUMN     "payout_operator" TEXT,
ADD COLUMN     "payout_phone" TEXT;

-- AlterTable
ALTER TABLE "payouts" ADD COLUMN     "commission_amount" DECIMAL(14,2),
ADD COLUMN     "commission_rate" DECIMAL(5,2),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gross_amount" DECIMAL(14,2),
ADD COLUMN     "order_id" TEXT,
ADD COLUMN     "paid_out_at" TIMESTAMP(3),
ADD COLUMN     "payout_type" "PayoutType" NOT NULL DEFAULT 'MERCHANT_REQUESTED',
ADD COLUMN     "released_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "payouts_order_id_key" ON "payouts"("order_id");

-- CreateIndex
CREATE INDEX "payouts_shop_id_released_at_idx" ON "payouts"("shop_id", "released_at");

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
