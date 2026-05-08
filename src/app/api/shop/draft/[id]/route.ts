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
    });

    if (!draft) {
      return NextResponse.json({ success: false, error: "Brouillon introuvable" }, { status: 404 });
    }

    // Vérifier expiration
    if (draft.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "Brouillon expiré" }, { status: 410 });
    }

    // Si encore en cours
    if (draft.status === "pending") {
      return NextResponse.json({
        success: false,
        status: "pending",
        message: "Génération encore en cours",
      });
    }

    // Si échec
    if (draft.status === "failed") {
      return NextResponse.json({
        success: false,
        status: "failed",
        error: draft.errorMessage || "Échec de génération",
      });
    }

    // Si prêt
    return NextResponse.json({
      success: true,
      status: "ready",
      data: {
        id: draft.id,
        shopName: draft.shopName,
        prompt: draft.prompt,
        generatedData: draft.generatedData,
        createdAt: draft.createdAt,
        expiresAt: draft.expiresAt,
        claimed: !!draft.userId,
      },
    });
  } catch (err) {
    console.error("[/api/shop/draft] Exception:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
