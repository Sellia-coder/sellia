import { db } from "@/lib/db";
import type { Coupon } from "@prisma/client";

export function calculateCouponDiscount(
  coupon: Pick<Coupon, "discountType" | "discountValue" | "maxDiscount">,
  subtotal: number
): number {
  if (subtotal <= 0) return 0;

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = Math.floor((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }
  return discount;
}

export async function validateCouponForCheckout(params: {
  shopId: string;
  code: string;
  subtotal: number;
  customerPhone?: string;
}): Promise<
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; error: string }
> {
  const code = params.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Code requis" };

  const coupon = await db.coupon.findUnique({
    where: { shopId_code: { shopId: params.shopId, code } },
  });

  if (!coupon) return { ok: false, error: "Code invalide" };
  if (!coupon.isActive) return { ok: false, error: "Code désactivé" };

  const now = new Date();
  if (coupon.startsAt > now) {
    return { ok: false, error: "Code pas encore actif" };
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    return { ok: false, error: "Code expiré" };
  }
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    return { ok: false, error: "Code épuisé" };
  }
  if (coupon.minOrderAmount && params.subtotal < coupon.minOrderAmount) {
    return {
      ok: false,
      error: `Montant minimum : ${coupon.minOrderAmount.toLocaleString("fr-FR")} FCFA`,
    };
  }

  const phone = params.customerPhone?.replace(/\s/g, "");
  if (phone) {
    const customerUsages = await db.couponUsage.count({
      where: { couponId: coupon.id, customerPhone: phone },
    });
    if (customerUsages >= (coupon.maxUsesPerCustomer || 1)) {
      return { ok: false, error: "Vous avez déjà utilisé ce code" };
    }
  }

  const discount = calculateCouponDiscount(coupon, params.subtotal);
  return { ok: true, coupon, discount };
}
