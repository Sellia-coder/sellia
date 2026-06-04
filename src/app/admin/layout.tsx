import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (!isAdminRole(user.role)) redirect("/dashboard");
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF7" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
        <div
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
            color: "#E84B1F",
            fontWeight: 700,
            marginBottom: "20px",
          }}
        >
          Sellia · Administration
        </div>
        {children}
      </div>
    </div>
  );
}
