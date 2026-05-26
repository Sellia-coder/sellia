-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "custom_domain_verified_at" TIMESTAMP(3),
ADD COLUMN     "footer_style" TEXT DEFAULT 'classic',
ADD COLUMN     "header_style" TEXT DEFAULT 'centered',
ADD COLUMN     "hero_style" TEXT DEFAULT 'image-text',
ADD COLUMN     "mobile_logo_url" TEXT,
ADD COLUMN     "product_grid_cols" INTEGER DEFAULT 3;

-- CreateTable
CREATE TABLE "shop_pages" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "meta_description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "show_in_header" BOOLEAN NOT NULL DEFAULT false,
    "show_in_footer" BOOLEAN NOT NULL DEFAULT true,
    "template_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_faqs" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shop_pages_shop_id_is_published_idx" ON "shop_pages"("shop_id", "is_published");

-- CreateIndex
CREATE UNIQUE INDEX "shop_pages_shop_id_slug_key" ON "shop_pages"("shop_id", "slug");

-- CreateIndex
CREATE INDEX "shop_faqs_shop_id_is_published_order_idx" ON "shop_faqs"("shop_id", "is_published", "order");

-- AddForeignKey
ALTER TABLE "shop_pages" ADD CONSTRAINT "shop_pages_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_faqs" ADD CONSTRAINT "shop_faqs_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
