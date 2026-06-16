-- Migration SIGNALÉE : shop_visits
-- À appliquer après accord : npx prisma migrate dev --name shop_visits

CREATE TABLE "shop_visits" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "path" TEXT,
    "country" TEXT,
    "city" TEXT,
    "region" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_visits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shop_visits_shop_id_created_at_idx" ON "shop_visits"("shop_id", "created_at");
CREATE INDEX "shop_visits_shop_id_session_id_created_at_idx" ON "shop_visits"("shop_id", "session_id", "created_at");
CREATE INDEX "shop_visits_shop_id_country_idx" ON "shop_visits"("shop_id", "country");

ALTER TABLE "shop_visits" ADD CONSTRAINT "shop_visits_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
