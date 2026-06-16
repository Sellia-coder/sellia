"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { PlatformSettingsData } from "@/lib/admin/platform-settings";
import { adminUpdatePlatformSettingsAction } from "@/app/actions/admin-settings";

function AdminSwitch({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  help?: string;
}) {
  return (
    <div className="admin-switch-row">
      <div className="admin-switch-copy">
        <span className="admin-switch-label">{label}</span>
        {help ? <span className="admin-switch-help">{help}</span> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`admin-switch ${checked ? "admin-switch--on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="admin-switch-thumb" />
      </button>
    </div>
  );
}

function SectionFeedback({
  status,
}: {
  status: "idle" | "ok" | "error";
}) {
  if (status === "idle") return null;
  return (
    <p
      className={`admin-feedback ${
        status === "ok" ? "admin-feedback--ok" : "admin-feedback--error"
      }`}
    >
      {status === "ok" ? "Enregistré." : "Erreur lors de l'enregistrement."}
    </p>
  );
}

export default function AdminParametresClient({
  initial,
  isSuperAdmin,
}: {
  initial: PlatformSettingsData;
  isSuperAdmin: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [platformStatus, setPlatformStatus] = useState<
    "idle" | "ok" | "error"
  >("idle");
  const [commStatus, setCommStatus] = useState<"idle" | "ok" | "error">(
    "idle"
  );

  const savePlatform = () => {
    startTransition(async () => {
      const res = await adminUpdatePlatformSettingsAction({
        maintenanceMode: form.maintenanceMode,
        maintenanceMessage: form.maintenanceMessage,
        registrationsOpen: form.registrationsOpen,
        shopCreationOpen: form.shopCreationOpen,
      });
      setPlatformStatus(res.ok ? "ok" : "error");
      if (!res.ok) alert(res.error ?? "Erreur");
      else setTimeout(() => setPlatformStatus("idle"), 3000);
    });
  };

  const saveCommunication = () => {
    startTransition(async () => {
      const res = await adminUpdatePlatformSettingsAction({
        merchantBannerEnabled: form.merchantBannerEnabled,
        merchantBannerMessage: form.merchantBannerMessage,
        supportEmail: form.supportEmail,
        supportPhone: form.supportPhone,
        adminNotifyEmail: form.adminNotifyEmail,
      });
      setCommStatus(res.ok ? "ok" : "error");
      if (!res.ok) alert(res.error ?? "Erreur");
      else setTimeout(() => setCommStatus("idle"), 3000);
    });
  };

  return (
    <div className="admin-parametres-grid">
      <section className="admin-premium-card">
        <h2 className="admin-premium-card-title">Plateforme</h2>
        <p className="admin-premium-card-help">
          Contrôle global de l&apos;accès et de la maintenance.
        </p>

        <AdminSwitch
          checked={form.maintenanceMode}
          onChange={(v) => setForm((f) => ({ ...f, maintenanceMode: v }))}
          label="Mode maintenance"
          help="Redirige les marchands (sauf admins) vers une page d'information."
        />
        <textarea
          className="admin-field-input"
          placeholder="Message affiché en maintenance"
          value={form.maintenanceMessage}
          onChange={(e) =>
            setForm((f) => ({ ...f, maintenanceMessage: e.target.value }))
          }
          rows={3}
        />

        <AdminSwitch
          checked={form.registrationsOpen}
          onChange={(v) => setForm((f) => ({ ...f, registrationsOpen: v }))}
          label="Inscriptions ouvertes"
          help="Autorise la création de nouveaux comptes marchands."
        />
        <AdminSwitch
          checked={form.shopCreationOpen}
          onChange={(v) => setForm((f) => ({ ...f, shopCreationOpen: v }))}
          label="Création de boutique ouverte"
          help="Permet aux marchands de publier une nouvelle boutique."
        />

        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={savePlatform}
          disabled={pending}
        >
          Enregistrer la plateforme
        </button>
        <SectionFeedback status={platformStatus} />
      </section>

      <section className="admin-premium-card">
        <h2 className="admin-premium-card-title">Communication</h2>
        <p className="admin-premium-card-help">
          Bannière dashboard, contacts support et alertes admin.
        </p>

        <AdminSwitch
          checked={form.merchantBannerEnabled}
          onChange={(v) =>
            setForm((f) => ({ ...f, merchantBannerEnabled: v }))
          }
          label="Bannière annonce marchands"
          help="Message informatif en haut du dashboard marchand."
        />
        <input
          className="admin-field-input"
          placeholder="Texte de la bannière"
          value={form.merchantBannerMessage}
          onChange={(e) =>
            setForm((f) => ({ ...f, merchantBannerMessage: e.target.value }))
          }
        />

        <div className="admin-field">
          <label>Email support (affiché)</label>
          <input
            className="admin-field-input"
            value={form.supportEmail}
            onChange={(e) =>
              setForm((f) => ({ ...f, supportEmail: e.target.value }))
            }
          />
        </div>
        <div className="admin-field">
          <label>Téléphone support</label>
          <input
            className="admin-field-input"
            value={form.supportPhone}
            onChange={(e) =>
              setForm((f) => ({ ...f, supportPhone: e.target.value }))
            }
          />
        </div>
        <div className="admin-field">
          <label>Email notifications admin</label>
          <input
            className="admin-field-input"
            value={form.adminNotifyEmail}
            onChange={(e) =>
              setForm((f) => ({ ...f, adminNotifyEmail: e.target.value }))
            }
          />
        </div>

        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={saveCommunication}
          disabled={pending}
        >
          Enregistrer la communication
        </button>
        <SectionFeedback status={commStatus} />
      </section>

      {isSuperAdmin ? (
        <section className="admin-premium-card admin-premium-card--accent">
          <h2 className="admin-premium-card-title">Super admin</h2>
          <p className="admin-premium-card-help">
            Raccourcis réservés au super administrateur.
          </p>
          <div className="admin-shortcut-links">
            <Link href="/admin/administrateurs" className="admin-btn">
              Gérer les administrateurs
            </Link>
            <Link href="/admin/audit" className="admin-btn admin-btn--ghost">
              Journal d&apos;audit
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
