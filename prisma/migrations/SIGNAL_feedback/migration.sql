-- Migration SIGNALÉE : merchant_feedbacks (retours marchands)
-- À appliquer après accord : npx prisma migrate dev --name feedback

CREATE TYPE "MerchantFeedbackType" AS ENUM ('SUGGESTION', 'REMARQUE', 'BUG', 'AUTRE');
CREATE TYPE "MerchantFeedbackStatus" AS ENUM ('NEW', 'READ', 'HANDLED');

CREATE TABLE "merchant_feedbacks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shop_id" TEXT,
    "type" "MerchantFeedbackType" NOT NULL DEFAULT 'SUGGESTION',
    "message" TEXT NOT NULL,
    "status" "MerchantFeedbackStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_feedbacks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "merchant_feedbacks_status_created_at_idx" ON "merchant_feedbacks"("status", "created_at");

ALTER TABLE "merchant_feedbacks" ADD CONSTRAINT "merchant_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "merchant_feedbacks" ADD CONSTRAINT "merchant_feedbacks_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
