-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "hero_image_generated_at" TIMESTAMP(3),
ADD COLUMN     "hero_image_generations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hero_image_prompt" TEXT;
