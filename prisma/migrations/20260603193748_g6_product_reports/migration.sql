-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('COUNTERFEIT', 'INAPPROPRIATE', 'MISLEADING', 'SCAM', 'PROHIBITED', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "product_reports" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT NOT NULL,
    "reporterName" TEXT,
    "reporterEmail" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_reports_shopId_idx" ON "product_reports"("shopId");

-- CreateIndex
CREATE INDEX "product_reports_productId_idx" ON "product_reports"("productId");

-- CreateIndex
CREATE INDEX "product_reports_status_idx" ON "product_reports"("status");

-- AddForeignKey
ALTER TABLE "product_reports" ADD CONSTRAINT "product_reports_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reports" ADD CONSTRAINT "product_reports_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
