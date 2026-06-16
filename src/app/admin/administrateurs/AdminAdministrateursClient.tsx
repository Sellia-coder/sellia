"use client";

import { useState, useTransition } from "react";
import {
  adminPromoteUserAction,
  adminDemoteAdminAction,
} from "@/app/actions/admin-admins";
import type { AdminAccountRow } from "@/lib/admin/admin-users";

function DemoteButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="admin-btn admin-btn--sm admin-btn--danger"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            "Rétrograder cet administrateur ? Il perdra l'accès au panneau admin."
          )
        ) {
          return;
        }
        startTransition(async () => {
          const res = await adminDemoteAdminAction(userId);
          if (res.ok) window.location.reload();
          else alert(res.error ?? "Erreur");
        });
      }}
    >
      Rétrograder
    </button>
  );
}

export default function AdminAdministrateursClient({
  admins,
}: {
  admins: AdminAccountRow[];
}) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const promote = () => {
    if (!email.trim()) return;
    if (
      !window.confirm(
        `Promouvoir ${email.trim()} en administrateur ?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await adminPromoteUserAction(email);
      if (res.ok) {
        setMessage(`${res.email} promu administrateur.`);
        setEmail("");
        window.location.reload();
      } else {
        alert(res.error ?? "Erreur");
      }
    });
  };

  return (
    <>
      <div className="admin-premium-card">
        <h2 className="admin-premium-card-title">Promouvoir un utilisateur</h2>
        <p className="admin-premium-card-help">
          Recherche par email exact du compte marchand existant.
        </p>
        <div className="admin-toolbar">
          <input
            type="email"
            className="admin-search"
            placeholder="email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={promote}
            disabled={pending || !email.trim()}
          >
            Promouvoir en admin
          </button>
        </div>
        {message ? (
          <p className="admin-feedback admin-feedback--ok">{message}</p>
        ) : null}
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <div className="admin-table-wrap">
          <table className="admin-table admin-table--premium">
            <thead>
              <tr>
                <th>Email</th>
                <th>Promu le</th>
                <th>Par</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-empty">
                    Aucun administrateur
                  </td>
                </tr>
              ) : (
                admins.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <span className="admin-mono" style={{ fontSize: 13 }}>
                        {a.email}
                      </span>
                      {a.isSuperAdmin ? (
                        <div style={{ marginTop: 6 }}>
                          <span className="admin-chip admin-chip--ember">
                            Super admin
                          </span>
                        </div>
                      ) : null}
                    </td>
                    <td className="admin-date">
                      {a.promotedAt
                        ? new Date(a.promotedAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td>{a.promotedByEmail ?? "—"}</td>
                    <td>
                      {!a.isSuperAdmin ? (
                        <DemoteButton userId={a.id} />
                      ) : (
                        <span className="admin-muted-text">Protégé</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
