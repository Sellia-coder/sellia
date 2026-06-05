-- Réglages opérationnels plateforme (éditables via /admin/parametres)

CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_message" TEXT,
    "registrations_open" BOOLEAN NOT NULL DEFAULT true,
    "shop_creation_open" BOOLEAN NOT NULL DEFAULT true,
    "merchant_banner_enabled" BOOLEAN NOT NULL DEFAULT false,
    "merchant_banner_message" TEXT,
    "support_email" TEXT,
    "support_phone" TEXT,
    "admin_notify_email" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "platform_settings" ("id", "updated_at")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
