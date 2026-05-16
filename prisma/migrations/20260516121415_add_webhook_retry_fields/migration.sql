-- AlterTable
ALTER TABLE "cartevo_webhook_logs" ADD COLUMN     "last_retry_at" TIMESTAMP(3),
ADD COLUMN     "next_retry_at" TIMESTAMP(3),
ADD COLUMN     "retry_count" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "cartevo_webhook_logs_processed_next_retry_at_idx" ON "cartevo_webhook_logs"("processed", "next_retry_at");
