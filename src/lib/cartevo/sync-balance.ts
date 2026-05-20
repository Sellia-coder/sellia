import { db } from "@/lib/db";
import { cartevoGetWalletBalance } from "./client";
import { safeLogger } from "@/lib/security/redact";

export async function syncShopCartevoBalance(shopId: string): Promise<{
  payin: number;
  payout: number;
}> {
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { id: true, country: true, currency: true },
  });

  if (!shop) throw new Error("Shop not found");

  const country = shop.country || "CM";
  const currency = shop.currency || "XAF";

  try {
    const bal = await cartevoGetWalletBalance({ country, currency });

    await db.shop.update({
      where: { id: shopId },
      data: {
        cartevoPayinBalance: bal.payin,
        cartevoPayoutBalance: bal.payout,
        cartevoBalanceUpdatedAt: new Date(),
      },
    });

    return { payin: bal.payin, payout: bal.payout };
  } catch (err) {
    safeLogger.error("Failed to sync Cartevo balance", {
      shopId,
      error: err instanceof Error ? err.message : String(err),
    });
    const fresh = await db.shop.findUnique({
      where: { id: shopId },
      select: { cartevoPayinBalance: true, cartevoPayoutBalance: true },
    });
    return {
      payin: Number(fresh?.cartevoPayinBalance ?? 0),
      payout: Number(fresh?.cartevoPayoutBalance ?? 0),
    };
  }
}
