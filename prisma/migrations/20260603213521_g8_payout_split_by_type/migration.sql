/*
  Warnings:

  - A unique constraint covering the columns `[order_id,payout_type]` on the table `payouts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payouts_order_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "payouts_order_id_payout_type_key" ON "payouts"("order_id", "payout_type");
