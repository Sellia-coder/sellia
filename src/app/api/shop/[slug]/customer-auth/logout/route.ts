import { NextResponse } from "next/server";
import { clearShopCustomerSession } from "@/lib/shop-customer/session";

export async function POST() {
  await clearShopCustomerSession();
  return NextResponse.json({ ok: true });
}
