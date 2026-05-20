-- AlterTable
ALTER TABLE "cartevo_transactions" ADD COLUMN     "balance_match_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "balance_match_source" TEXT,
ADD COLUMN     "balance_matched_at" TIMESTAMP(3),
ADD COLUMN     "payin_balance_after" DECIMAL(15,2),
ADD COLUMN     "payin_balance_before" DECIMAL(15,2);
