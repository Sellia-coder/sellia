-- Notes admin + trace vérification manuelle (retraits, pas d'impact money)

ALTER TABLE "payouts" ADD COLUMN "admin_internal_note" TEXT;
ALTER TABLE "payouts" ADD COLUMN "admin_verified_at" TIMESTAMP(3);
ALTER TABLE "payouts" ADD COLUMN "admin_verified_by" TEXT;
