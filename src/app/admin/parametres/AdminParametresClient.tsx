"use client";

import { useState, useTransition } from "react";
import type { PlatformSettingsData } from "@/lib/admin/platform-settings";
import { adminUpdatePlatformSettingsAction } from "@/app/actions/admin-settings";

export default function AdminParametresClient({
  initial,
}: {
  initial: PlatformSettingsData;
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const save = () => {
    startTransition(async () => {
      const res = await adminUpdatePlatformSettingsAction(form);
      if (res.ok) setSaved(true);
      else alert(res.error ?? "Erreur");
    });
  };

  return (
    <div className="admin-settings-form">
      <div className="admin-detail-card">
        <h2 className="admin-detail-card-title">Opérationnel</h2>

        <label className="admin-settings-row">
          <input
            type="checkbox"
            checked={form.maintenanceMode}
            onChange={(e) =>
              setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))
            }
          />
          <span>Mode maintenance plateforme</span>
        </label>
        <textarea
          className="admin-search"
          style={{ width: "100%", minHeight: 72, marginBottom: 12 }}
          placeholder="Message affiché en maintenance"
          value={form.maintenanceMessage}
          onChange={(e) =>
            setForm((f) => ({ ...f, maintenanceMessage: e.target.value }))
          }
        />

        <label className="admin-settings-row">
          <input
            type="checkbox"
            checked={form.registrationsOpen}
            onChange={(e) =>
              setForm((f) => ({ ...f, registrationsOpen: e.target.checked }))
            }
          />
          <span>Inscriptions ouvertes</span>
        </label>

        <label className="admin-settings-row">
          <input
            type="checkbox"
            checked={form.shopCreationOpen}
            onChange={(e) =>
              setForm((f) => ({ ...f, shopCreationOpen: e.target.checked }))
            }
          />
          <span>Création de boutique ouverte</span>
        </label>

        <label className="admin-settings-row">
          <input
            type="checkbox"
            checked={form.merchantBannerEnabled}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                merchantBannerEnabled: e.target.checked,
              }))
            }
          />
          <span>Bannière annonce marchands (dashboard)</span>
        </label>
        <input
          className="admin-search"
          style={{ width: "100%", marginBottom: 12 }}
          placeholder="Texte de la bannière"
          value={form.merchantBannerMessage}
          onChange={(e) =>
            setForm((f) => ({ ...f, merchantBannerMessage: e.target.value }))
          }
        />

        <div className="admin-settings-field">
          <label>Email support (affiché)</label>
          <input
            className="admin-search"
            style={{ width: "100%" }}
            value={form.supportEmail}
            onChange={(e) =>
              setForm((f) => ({ ...f, supportEmail: e.target.value }))
            }
          />
        </div>
        <div className="admin-settings-field">
          <label>Téléphone support</label>
          <input
            className="admin-search"
            style={{ width: "100%" }}
            value={form.supportPhone}
            onChange={(e) =>
              setForm((f) => ({ ...f, supportPhone: e.target.value }))
            }
          />
        </div>
        <div className="admin-settings-field">
          <label>Email notifications admin</label>
          <input
            className="admin-search"
            style={{ width: "100%" }}
            value={form.adminNotifyEmail}
            onChange={(e) =>
              setForm((f) => ({ ...f, adminNotifyEmail: e.target.value }))
            }
          />
        </div>

        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={save}
          disabled={pending}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved ? (
          <p className="admin-method-note" style={{ marginTop: 12 }}>
            Paramètres enregistrés.
          </p>
        ) : null}
      </div>
    </div>
  );
}
