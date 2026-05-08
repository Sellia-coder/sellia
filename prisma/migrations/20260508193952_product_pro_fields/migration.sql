/*
  Warnings:

  - A unique constraint covering the columns `[shopId,slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "comparePrice" INTEGER,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'XAF',
ADD COLUMN     "customCategory" TEXT,
ADD COLUMN     "digitalFileUrl" TEXT,
ADD COLUMN     "downloadLimit" INTEGER,
ADD COLUMN     "galleryUrls" JSONB,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "stock" INTEGER,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'physical',
ADD COLUMN     "unlimitedStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "weight" INTEGER;

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Product_shopId_slug_key" ON "Product"("shopId", "slug");
