-- CreateEnum
CREATE TYPE "FeatureCode" AS ENUM ('COD');

-- CreateTable
CREATE TABLE "shop_feature_unlocks" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "feature" "FeatureCode" NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAmount" INTEGER NOT NULL,
    "paymentMethod" TEXT,
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_feature_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shop_feature_unlocks_shopId_idx" ON "shop_feature_unlocks"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_feature_unlocks_shopId_feature_key" ON "shop_feature_unlocks"("shopId", "feature");

-- AddForeignKey
ALTER TABLE "shop_feature_unlocks" ADD CONSTRAINT "shop_feature_unlocks_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
