import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { backfillCustomersFromOrders } from "@/lib/customers";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const shop = await db.shop.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Aucune boutique trouvée" },
        { status: 404 }
      );
    }

    const result = await backfillCustomersFromOrders(shop.id);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
