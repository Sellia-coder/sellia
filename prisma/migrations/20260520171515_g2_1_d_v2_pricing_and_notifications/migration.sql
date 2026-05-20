-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fee_mode" TEXT NOT NULL DEFAULT 'merchant_absorbs',
ADD COLUMN     "notified_admin_at" TIMESTAMP(3),
ADD COLUMN     "notified_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cod_available" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fee_mode" TEXT NOT NULL DEFAULT 'merchant_absorbs';

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "business_since" TIMESTAMP(3),
ADD COLUMN     "cartevo_balance_updated_at" TIMESTAMP(3),
ADD COLUMN     "cartevo_payin_balance" DECIMAL(15,2),
ADD COLUMN     "cartevo_payout_balance" DECIMAL(15,2),
ADD COLUMN     "cod_commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cod_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan_renewal_at" TIMESTAMP(3),
ADD COLUMN     "pro_since" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "cartevo_transactions" ADD COLUMN     "cartevo_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fee_mode_snapshot" TEXT NOT NULL DEFAULT 'merchant_absorbs',
ADD COLUMN     "sellia_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "shop_plan_at_time" TEXT NOT NULL DEFAULT 'free',
ALTER COLUMN "net_amount" SET DEFAULT 0;
