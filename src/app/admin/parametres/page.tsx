import Link from "next/link";
import { getAdminPlatformConfig } from "@/lib/admin/platform-config";
import { getPlatformSettings } from "@/lib/admin/platform-settings";
import { isSuperAdmin } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import AdminParametresClient from "./AdminParametresClient";
import AdminMoneySettingsClient from "./AdminMoneySettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminParametresPage() {
  const user = await getCurrentUser();
  const [config, settings] = await Promise.all([
    getAdminPlatformConfig(),
    getPlatformSettings(),
  ]);
  const superAdmin = user ? isSuperAdmin(user) : false;

  return (
    <div className="admin-parametres-page">
      <header className="admin-page-header-premium">
        <h1 className="admin-page-title">Paramètres</h1>
        <p className="admin-page-sub">
          Réglages opérationnels et financiers. Les paramètres money sont éditables
          uniquement par le super administrateur.
        </p>
      </header>

      <AdminParametresClient
        initial={settings}
        isSuperAdmin={superAdmin}
      />

      <AdminMoneySettingsClient config={config} isSuperAdmin={superAdmin} />

      <section className="admin-premium-card admin-premium-card--readonly">
        <h2 className="admin-premium-card-title">Frais opérateurs par pays</h2>
        <p className="admin-premium-card-help">
          Grille Cartevo — lecture seule (hors périmètre money Sellia).
        </p>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--premium">
            <thead>
              <tr>
                <th>Pays</th>
                <th>Devise</th>
                <th>Encaissement</th>
                <th>Retrait</th>
                <th>Frais retrait marchand</th>
                <th>Opérateurs</th>
              </tr>
            </thead>
            <tbody>
              {config.countries.map((c) => (
                <tr key={c.code}>
                  <td>{c.code}</td>
                  <td>{c.currency}</td>
                  <td className="sellia-num">{c.payinRate} %</td>
                  <td className="sellia-num">{c.payoutRate} %</td>
                  <td className="sellia-num">{c.withdrawalFeeRate} %</td>
                  <td>{c.operators.length ? c.operators.join(", ") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="admin-method-note">
        <Link href="/admin/audit">Journal d&apos;audit</Link> — chaque modification
        des paramètres y est tracée.
      </p>
    </div>
  );
}
