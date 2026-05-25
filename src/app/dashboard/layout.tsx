import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import DashboardLayoutClient from "./DashboardLayoutClient";
import "./dashboard-typography.css";

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
    select: { slug: true, name: true, primaryColor: true, plan: true },
  });

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
              name: shop.name,
              primaryColor: shop.primaryColor,
            }
          : null
      }
      userHeader={{
        name: displayName,
        initial,
        plan: shop?.plan ?? "free",
      }}
    >
      {children}
    </DashboardLayoutClient>
  );
}
