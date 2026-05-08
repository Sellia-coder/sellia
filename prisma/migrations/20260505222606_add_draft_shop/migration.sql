-- CreateTable
CREATE TABLE "DraftShop" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "generatedData" JSONB,
    "ipAddress" TEXT,
    "userId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftShop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DraftShop_userId_idx" ON "DraftShop"("userId");

-- CreateIndex
CREATE INDEX "DraftShop_status_idx" ON "DraftShop"("status");

-- CreateIndex
CREATE INDEX "DraftShop_expiresAt_idx" ON "DraftShop"("expiresAt");
