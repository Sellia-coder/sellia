import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getSidebarCounts, type SidebarCounts } from "@/lib/sidebar-counts";
import DashboardLayoutClient from "./DashboardLayoutClient";
import "./dashboard-typography.css";

const emptySidebarCounts: SidebarCounts = {
  products: { lowStock: 0, total: 0 },
  orders: { pending: 0, toDeliver: 0, actionRequired: 0 },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/connexion");
  }

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      slug: true,
      customDomain: true,
      plan: true,
    },
  });

  const sidebarCounts = shop
    ? await getSidebarCounts(shop.id)
    : emptySidebarCounts;

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email.split("@")[0];
  const initial = (
    user.firstName?.charAt(0) ||
    user.email.charAt(0) ||
    "?"
  ).toUpperCase();

  return (
    <DashboardLayoutClient
      shop={
        shop
          ? {
              slug: shop.slug,
              customDomain: shop.customDomain,
            }
          : null
      }
      userHeader={{
        name: displayName,
        initial,
        plan: shop?.plan ?? "free",
      }}
      sidebarCounts={sidebarCounts}
    >
      {children}
    </DashboardLayoutClient>
  );
}
