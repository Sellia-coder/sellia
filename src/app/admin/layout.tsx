import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/connexion");
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
