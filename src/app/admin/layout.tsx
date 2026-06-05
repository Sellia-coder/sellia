import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/admin";
import AdminLayoutClient from "./AdminLayoutClient";
import "./admin.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (!isAdminRole(user.role)) redirect("/dashboard");

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
    >
      {children}
    </AdminLayoutClient>
  );
}
