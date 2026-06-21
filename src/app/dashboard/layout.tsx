import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { getSidebarCounts, type SidebarCounts } from "@/lib/sidebar-counts";
import DashboardLayoutClient from "./DashboardLayoutClient";
import {
  formatMerchantDisplayName,
  merchantInitial,
} from "@/lib/utils/capitalize-name";
import MerchantBanner from "@/components/dashboard/MerchantBanner";
import { getPlatformSettings } from "@/lib/admin/platform-settings";
import { refreshMoneyConfigCache } from "@/lib/admin/money-config";
import "./dashboard-typography.css";

const emptySidebarCounts: SidebarCounts = {
  products: { lowStock: 0, total: 0 },
  orders: { pending: 0, toDeliver: 0, actionRequired: 0 },
  chat: { unread: 0 },
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

  const settings = await getPlatformSettings();
  await refreshMoneyConfigCache();
  if (settings.maintenanceMode && !isAdminRole(user.role)) {
    redirect("/maintenance");
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

  const displayName = formatMerchantDisplayName(
    user.firstName,
    user.lastName,
    user.email
  );
  const initial = merchantInitial(user.firstName, user.email);

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
      isAdmin={isAdminRole(user.role)}
    >
      {settings.merchantBannerEnabled && settings.merchantBannerMessage ? (
        <MerchantBanner message={settings.merchantBannerMessage} />
      ) : null}
      {children}
    </DashboardLayoutClient>
  );
}
