-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'fr',
ADD COLUMN     "notification_prefs" JSONB,
ADD COLUMN     "timezone" TEXT;
