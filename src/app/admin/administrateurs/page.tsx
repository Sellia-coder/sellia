import { requireSuperAdminPage } from "@/lib/auth/admin";
import { listAdminAccounts } from "@/lib/admin/admin-users";
import AdminAdministrateursClient from "./AdminAdministrateursClient";

export const dynamic = "force-dynamic";

export default async function AdminAdministrateursPage() {
  await requireSuperAdminPage();
  const admins = await listAdminAccounts();

  return (
    <div>
      <h1 className="admin-page-title">Administrateurs</h1>
      <p className="admin-page-sub">
        Gestion réservée au super administrateur. Promotion et rétrogradation
        tracées dans le journal d&apos;audit.
      </p>

      <AdminAdministrateursClient admins={admins} />
    </div>
  );
}
