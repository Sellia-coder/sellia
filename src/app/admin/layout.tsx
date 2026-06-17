import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminRole, isSuperAdmin } from "@/lib/auth/admin";
import AdminLayoutClient from "./AdminLayoutClient";
import AdminTodoBanner from "@/components/admin/AdminTodoBanner";
import { getAdminTodoCounts } from "@/lib/admin/todo-counts";
import { ensurePublicMaintenanceCookieSynced } from "@/lib/maintenance/public";
import { refreshMoneyConfigCache } from "@/lib/admin/money-config";
import "./admin.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (!isAdminRole(user.role)) redirect("/dashboard");

  await ensurePublicMaintenanceCookieSynced();
  await refreshMoneyConfigCache();

  const todoCounts = await getAdminTodoCounts();

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Administrateur";
  const initial = (
    user.firstName?.charAt(0) ||
    user.email.charAt(0) ||
    "A"
  ).toUpperCase();

  return (
    <AdminLayoutClient
      userHeader={{
        name: displayName,
        initial,
        email: user.email,
      }}
      isSuperAdmin={isSuperAdmin(user)}
      newMerchantFeedbacks={todoCounts.newMerchantFeedbacks}
      newLandingSupport={todoCounts.newLandingSupport}
    >
      <AdminTodoBanner counts={todoCounts} />
      {children}
    </AdminLayoutClient>
  );
}
