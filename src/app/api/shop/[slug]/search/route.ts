import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const shop = await db.shop.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, status: true, isPublished: true },
  });

  if (!shop || shop.status !== "published" || !shop.isPublished) {
    return NextResponse.json({ products: [] });
  }

  const products = await db.product.findMany({
    where: {
      shopId: shop.id,
      status: "active",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      imageUrl: true,
      emoji: true,
      category: true,
    },
    take: 12,
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ products });
}
