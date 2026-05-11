/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "paymentSubMethod" TEXT,
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "qrScannedAt" TIMESTAMP(3),
ADD COLUMN     "refundDeadline" TIMESTAMP(3),
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "planActivatedAt" TIMESTAMP(3),
ADD COLUMN     "planExpiresAt" TIMESTAMP(3),
ALTER COLUMN "plan" SET DEFAULT 'free';

-- CreateIndex
CREATE UNIQUE INDEX "Order_qrCode_key" ON "Order"("qrCode");

-- CreateIndex
CREATE INDEX "Order_qrCode_idx" ON "Order"("qrCode");
