-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "paymentCashOnDelivery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paymentOnlineEscrow" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "shippingZones" JSONB;
