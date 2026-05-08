import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: "ID manquant" }, { status: 400 });
  }

  try {
    const draft = await db.draftShop.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        errorMessage: true,
        expiresAt: true,
      },
    });

    if (!draft) {
      return NextResponse.json({ success: false, error: "Brouillon introuvable" }, { status: 404 });
    }

    // Vérifier expiration
    if (draft.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "Brouillon expiré" }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      status: draft.status,
      errorMessage: draft.errorMessage,
    });
  } catch (err) {
    console.error("[/api/shop/status] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
