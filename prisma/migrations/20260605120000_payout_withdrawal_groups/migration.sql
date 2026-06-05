-- G7 — Groupement des retraits marchand + traçabilité admin / Cartevo

ALTER TABLE "payouts" ADD COLUMN "withdrawal_group_id" TEXT;
ALTER TABLE "payouts" ADD COLUMN "withdrawal_gross_amount" DECIMAL(14,2);
ALTER TABLE "payouts" ADD COLUMN "withdrawal_net_amount" DECIMAL(14,2);
ALTER TABLE "payouts" ADD COLUMN "cartevo_tx_id" TEXT;
ALTER TABLE "payouts" ADD COLUMN "reviewed_by" TEXT;
ALTER TABLE "payouts" ADD COLUMN "reviewed_at" TIMESTAMP(3);
ALTER TABLE "payouts" ADD COLUMN "rejection_reason" TEXT;
ALTER TABLE "payouts" ADD COLUMN "manual_review_required" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "payouts_withdrawal_group_id_idx" ON "payouts"("withdrawal_group_id");
CREATE INDEX "payouts_cartevo_tx_id_idx" ON "payouts"("cartevo_tx_id");
