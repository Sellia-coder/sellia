"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  updateProfileAction,
  updateShopBasicsAction,
  updatePasswordAction,
  toggleTwoFactorAction,
  revokeSessionAction,
  updateNotificationPrefsAction,
  deleteAccountAction,
} from "@/app/actions/profile";

export interface ReglagesUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  avatarUrl: string | null;
  bio: string;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  authProvider: string;
  notificationPrefs: Record<string, boolean>;
}

export interface ReglagesShop {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  contactEmail: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
}

export interface ReglagesSession {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  device: string | null;
  location: string | null;
}

interface Props {
  initialTab: string;
  user: ReglagesUser;
  shop: ReglagesShop | null;
  sessions: ReglagesSession[];
}

type Tab = "general" | "profil" | "boutique" | "notifications" | "securite" | "danger";

const COUNTRIES = [
  { code: "CM", name: "Cameroun" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "SN", name: "Sénégal" },
  { code: "CD", name: "RD Congo" },
  { code: "BJ", name: "Bénin" },
  { code: "BF", name: "Burkina Faso" },
  { code: "CG", name: "Congo" },
  { code: "GA", name: "Gabon" },
  { code: "ML", name: "Mali" },
  { code: "TG", name: "Togo" },
  { code: "NE", name: "Niger" },
  { code: "FR", name: "France" },
];

const TIMEZONES = [
  { value: "Africa/Abidjan", label: "(GMT+0) Abidjan, Bamako, Dakar" },
  { value: "Africa/Douala", label: "(GMT+1) Douala, Yaoundé, Kinshasa" },
  { value: "Africa/Lagos", label: "(GMT+1) Lagos, Brazzaville" },
  { value: "Africa/Nairobi", label: "(GMT+3) Nairobi" },
  { value: "Europe/Paris", label: "(GMT+1) Paris" },
];

const NOTIFICATION_ITEMS = [
  { key: "email_new_order", group: "Commandes", label: "Nouvelle commande", desc: "Email à chaque vente", channel: "Email" },
  { key: "whatsapp_new_order", group: "Commandes", label: "Nouvelle commande", desc: "Notification WhatsApp instantanée", channel: "WhatsApp" },
  { key: "email_order_paid", group: "Commandes", label: "Paiement confirmé", desc: "Mobile Money ou carte", channel: "Email" },
  { key: "email_low_stock", group: "Commandes", label: "Stock faible", desc: "Quand un produit a moins de 5 unités", channel: "Email" },
  { key: "email_payout_completed", group: "Paiements", label: "Retrait effectué", desc: "Confirmation virement vers votre compte", channel: "Email" },
  { key: "email_payout_failed", group: "Paiements", label: "Échec de retrait", desc: "Alerte immédiate si problème", channel: "Email" },
  { key: "email_coupon_used", group: "Marketing", label: "Coupon utilisé", desc: "Quand un client utilise un coupon", channel: "Email" },
  { key: "email_weekly_summary", group: "Marketing", label: "Résumé hebdomadaire", desc: "Tous les lundis matin avec vos stats", channel: "Email" },
];

export default function ReglagesClient({
  initialTab,
  user: initialUser,
  shop: initialShop,
  sessions,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>((initialTab as Tab) || "general");

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`/dashboard/reglages?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Paramètres</div>
          <h1 className="dash-page-title">Réglages</h1>
          <p className="dash-page-subtitle">
            Gérez votre profil, votre boutique, votre sécurité et vos préférences.
          </p>
        </div>
      </div>

      <div className="dash-tabs-bar dash-animate-fade-up dash-animate-delay-1">
        <button type="button" className={`dash-tab ${tab === "general" ? "active" : ""}`} onClick={() => handleTabChange("general")}>Général</button>
        <button type="button" className={`dash-tab ${tab === "profil" ? "active" : ""}`} onClick={() => handleTabChange("profil")}>Profil</button>
        <button type="button" className={`dash-tab ${tab === "boutique" ? "active" : ""}`} onClick={() => handleTabChange("boutique")}>Boutique</button>
        <button type="button" className={`dash-tab ${tab === "notifications" ? "active" : ""}`} onClick={() => handleTabChange("notifications")}>Notifications</button>
        <button type="button" className={`dash-tab ${tab === "securite" ? "active" : ""}`} onClick={() => handleTabChange("securite")}>Sécurité</button>
        <button type="button" className={`dash-tab ${tab === "danger" ? "active" : ""}`} onClick={() => handleTabChange("danger")} style={{ color: tab === "danger" ? "var(--dash-danger)" : undefined }}>Zone dangereuse</button>
      </div>

      {tab === "general" && <GeneralTab user={initialUser} />}
      {tab === "profil" && <ProfilTab user={initialUser} />}
      {tab === "boutique" && initialShop && <BoutiqueTab shop={initialShop} />}
      {tab === "notifications" && <NotificationsTab user={initialUser} />}
      {tab === "securite" && <SecuriteTab user={initialUser} sessions={sessions} />}
      {tab === "danger" && <DangerTab user={initialUser} />}
    </>
  );
}

function GeneralTab({ user: initialUser }: { user: ReglagesUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateProfileAction({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        country: user.country,
        city: user.city,
        bio: user.bio,
        language: user.language,
        timezone: user.timezone,
      });
      if (res.ok) {
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2500);
        router.refresh();
      } else {
        alert(res.error || "Erreur");
      }
    });
  };

  return (
    <div className="dash-settings-section dash-animate-fade-up">
      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Informations générales</h3>
            <p className="dash-settings-card-desc">Préférences globales de votre interface Sellia.</p>
          </div>
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Langue de l&apos;interface</label>
          <select className="dash-form-select" value={user.language} onChange={(e) => setUser({ ...user, language: e.target.value })}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Fuseau horaire</label>
          <select className="dash-form-select" value={user.timezone} onChange={(e) => setUser({ ...user, timezone: e.target.value })}>
            <option value="">— Choisir un fuseau —</option>
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: "16px" }}>
          <button type="button" onClick={handleSave} disabled={isPending} className="dash-btn dash-btn-ember dash-btn-sm">
            {savedAt ? "✓ Enregistré" : isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilTab({ user: initialUser }: { user: ReglagesUser }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateProfileAction({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        country: user.country,
        city: user.city,
        bio: user.bio,
      });
      if (res.ok) {
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2500);
        router.refresh();
      } else {
        alert(res.error || "Erreur");
      }
    });
  };

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/hero", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        const updateRes = await updateProfileAction({ avatarUrl: data.url });
        if (updateRes.ok) {
          setUser({ ...user, avatarUrl: data.url });
          router.refresh();
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!confirm("Supprimer votre photo de profil ?")) return;
    const res = await updateProfileAction({ avatarUrl: null });
    if (res.ok) {
      setUser({ ...user, avatarUrl: null });
      router.refresh();
    }
  };

  const initials = (user.firstName?.[0] || user.email[0] || "?").toUpperCase();

  return (
    <div className="dash-settings-section dash-animate-fade-up">
      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Photo de profil</h3>
            <p className="dash-settings-card-desc">JPG ou PNG. 2 Mo maximum recommandés.</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--dash-border)" }} />
          ) : (
            <div className="dash-cell-customer-avatar" style={{ width: "72px", height: "72px", fontSize: "24px" }}>{initials}</div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <label className="dash-btn dash-btn-secondary dash-btn-sm" style={{ cursor: "pointer" }}>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} style={{ display: "none" }} />
              {uploading ? "Upload..." : user.avatarUrl ? "Changer" : "Téléverser"}
            </label>
            {user.avatarUrl && (
              <button type="button" onClick={handleAvatarRemove} className="dash-btn dash-btn-ghost dash-btn-sm">Supprimer</button>
            )}
          </div>
        </div>
      </div>

      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Identité</h3>
            <p className="dash-settings-card-desc">Visibles uniquement par vous.</p>
          </div>
        </div>
        <div className="dash-form-row-split">
          <div className="dash-form-row">
            <label className="dash-form-label">Prénom</label>
            <input type="text" className="dash-form-input" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} placeholder="Jean" />
          </div>
          <div className="dash-form-row">
            <label className="dash-form-label">Nom</label>
            <input type="text" className="dash-form-input" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} placeholder="ANGOULA" />
          </div>
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Email</label>
          <input type="email" className="dash-form-input" value={user.email} disabled style={{ background: "var(--dash-bg-active)", cursor: "not-allowed" }} />
          <p style={{ fontSize: "11px", color: "var(--dash-text-secondary)", marginTop: "4px" }}>L&apos;email ne peut pas être modifié. Contactez le support si besoin.</p>
        </div>
        <div className="dash-form-row-split">
          <div className="dash-form-row">
            <label className="dash-form-label">Téléphone</label>
            <input type="tel" className="dash-form-input" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} placeholder="+237 6XX XX XX XX" />
          </div>
          <div className="dash-form-row">
            <label className="dash-form-label">Pays</label>
            <select className="dash-form-select" value={user.country} onChange={(e) => setUser({ ...user, country: e.target.value })}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Ville</label>
          <input type="text" className="dash-form-input" value={user.city} onChange={(e) => setUser({ ...user, city: e.target.value })} placeholder="Douala" />
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Bio (optionnel)</label>
          <textarea className="dash-form-textarea" rows={3} value={user.bio} onChange={(e) => setUser({ ...user, bio: e.target.value })} placeholder="Quelques mots pour vous présenter..." maxLength={300} />
          <p style={{ fontSize: "11px", color: "var(--dash-text-secondary)", marginTop: "4px", textAlign: "right" }}>{user.bio.length}/300 caractères</p>
        </div>
        <div style={{ marginTop: "8px" }}>
          <button type="button" onClick={handleSave} disabled={isPending} className="dash-btn dash-btn-ember dash-btn-sm">
            {savedAt ? "✓ Enregistré" : isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BoutiqueTab({ shop: initialShop }: { shop: ReglagesShop }) {
  const router = useRouter();
  const [shop, setShop] = useState(initialShop);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateShopBasicsAction({
        name: shop.name,
        tagline: shop.tagline,
        description: shop.description,
        contactEmail: shop.contactEmail,
        phone: shop.phone,
        whatsappNumber: shop.whatsappNumber,
        address: shop.address,
        instagramUrl: shop.instagramUrl,
        facebookUrl: shop.facebookUrl,
      });
      if (res.ok) {
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2500);
        router.refresh();
      } else {
        alert(res.error || "Erreur");
      }
    });
  };

  return (
    <div className="dash-settings-section dash-animate-fade-up">
      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Identité de la boutique</h3>
            <p className="dash-settings-card-desc">L&apos;apparence visuelle (couleurs, polices, logo) est gérée dans Boutique &gt; Apparence.</p>
          </div>
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Nom de la boutique</label>
          <input type="text" className="dash-form-input" value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} />
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Slug (URL)</label>
          <input type="text" className="dash-form-input" value={`${shop.slug}.getsellia.com`} disabled style={{ background: "var(--dash-bg-active)", cursor: "not-allowed", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }} />
          <p style={{ fontSize: "11px", color: "var(--dash-text-secondary)", marginTop: "4px" }}>Le slug ne peut pas être modifié. Pour un domaine personnalisé, voir Boutique &gt; SEO &amp; Domaine.</p>
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Tagline / Slogan</label>
          <input type="text" className="dash-form-input" value={shop.tagline} onChange={(e) => setShop({ ...shop, tagline: e.target.value })} placeholder="Ex: La référence pour..." maxLength={120} />
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Description</label>
          <textarea className="dash-form-textarea" rows={3} value={shop.description} onChange={(e) => setShop({ ...shop, description: e.target.value })} placeholder="Décrivez votre boutique en quelques phrases." maxLength={500} />
        </div>
      </div>

      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Coordonnées</h3>
            <p className="dash-settings-card-desc">Affichées sur votre boutique pour vos clients.</p>
          </div>
        </div>
        <div className="dash-form-row-split">
          <div className="dash-form-row">
            <label className="dash-form-label">Email de contact</label>
            <input type="email" className="dash-form-input" value={shop.contactEmail} onChange={(e) => setShop({ ...shop, contactEmail: e.target.value })} placeholder="contact@maboutique.com" />
          </div>
          <div className="dash-form-row">
            <label className="dash-form-label">Téléphone</label>
            <input type="tel" className="dash-form-input" value={shop.phone} onChange={(e) => setShop({ ...shop, phone: e.target.value })} placeholder="+237 6XX XX XX XX" />
          </div>
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Numéro WhatsApp Business</label>
          <input type="tel" className="dash-form-input" value={shop.whatsappNumber} onChange={(e) => setShop({ ...shop, whatsappNumber: e.target.value })} placeholder="+237 6XX XX XX XX" />
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Adresse</label>
          <textarea className="dash-form-textarea" rows={2} value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} placeholder="Rue, ville, pays" />
        </div>
      </div>

      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Réseaux sociaux</h3>
            <p className="dash-settings-card-desc">Liens affichés dans le footer de votre boutique.</p>
          </div>
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Instagram</label>
          <input type="url" className="dash-form-input" value={shop.instagramUrl} onChange={(e) => setShop({ ...shop, instagramUrl: e.target.value })} placeholder="https://instagram.com/votre_compte" />
        </div>
        <div className="dash-form-row">
          <label className="dash-form-label">Facebook</label>
          <input type="url" className="dash-form-input" value={shop.facebookUrl} onChange={(e) => setShop({ ...shop, facebookUrl: e.target.value })} placeholder="https://facebook.com/votre_page" />
        </div>
      </div>

      <div style={{ marginTop: "8px" }}>
        <button type="button" onClick={handleSave} disabled={isPending} className="dash-btn dash-btn-ember dash-btn-sm">
          {savedAt ? "✓ Enregistré" : isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function NotificationsTab({ user }: { user: ReglagesUser }) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    NOTIFICATION_ITEMS.forEach((item) => {
      defaults[item.key] = user.notificationPrefs[item.key] ?? true;
    });
    return defaults;
  });
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const togglePref = (key: string) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateNotificationPrefsAction(prefs);
      if (res.ok) {
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2500);
        router.refresh();
      }
    });
  };

  const groups: Record<string, typeof NOTIFICATION_ITEMS> = {};
  NOTIFICATION_ITEMS.forEach((item) => {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  });

  return (
    <div className="dash-settings-section dash-animate-fade-up">
      {Object.entries(groups).map(([groupName, items]) => (
        <div key={groupName} className="dash-settings-card">
          <div className="dash-settings-card-header">
            <div>
              <h3 className="dash-settings-card-title">{groupName}</h3>
            </div>
          </div>
          {items.map((item) => (
            <div key={item.key} className="dash-toggle-row">
              <div className="dash-toggle-info">
                <div className="dash-toggle-info-title">
                  {item.label}{" "}
                  <span style={{ marginLeft: "8px", fontSize: "11px", padding: "2px 6px", background: "var(--dash-bg-active)", borderRadius: "4px", fontWeight: 500, color: "var(--dash-text-secondary)" }}>{item.channel}</span>
                </div>
                <div className="dash-toggle-info-desc">{item.desc}</div>
              </div>
              <button type="button" onClick={() => togglePref(item.key)} className={`dash-switch ${prefs[item.key] ? "active" : ""}`}></button>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop: "8px" }}>
        <button type="button" onClick={handleSave} disabled={isPending} className="dash-btn dash-btn-ember dash-btn-sm">
          {savedAt ? "✓ Enregistré" : isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function SecuriteTab({ user, sessions }: { user: ReglagesUser; sessions: ReglagesSession[] }) {
  const router = useRouter();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePasswordChange = () => {
    setPwdError(null);
    if (newPwd !== confirmPwd) {
      setPwdError("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPwd.length < 8) {
      setPwdError("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    startTransition(async () => {
      const res = await updatePasswordAction(currentPwd, newPwd);
      if (res.ok) {
        setPwdSaved(true);
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
        setTimeout(() => setPwdSaved(false), 2500);
      } else {
        setPwdError(res.error || "Erreur");
      }
    });
  };

  const handleToggle2FA = () => {
    startTransition(async () => {
      const res = await toggleTwoFactorAction(!user.twoFactorEnabled);
      if (res.ok) router.refresh();
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    if (!confirm("Déconnecter cet appareil ?")) return;
    startTransition(async () => {
      await revokeSessionAction(sessionId);
      router.refresh();
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { device: "Appareil inconnu", browser: "" };
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    let browser = "Navigateur";
    if (/Chrome\//.test(ua) && !/Edge/.test(ua)) browser = "Chrome";
    else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
    else if (/Firefox\//.test(ua)) browser = "Firefox";
    else if (/Edge\//.test(ua)) browser = "Edge";
    return { device: isMobile ? "Mobile" : "Desktop", browser };
  };

  return (
    <div className="dash-settings-section dash-animate-fade-up">
      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Mot de passe</h3>
            <p className="dash-settings-card-desc">
              {user.authProvider === "google"
                ? "Vous êtes connecté avec Google. Modifiez votre mot de passe directement sur Google."
                : "Choisissez un mot de passe d'au moins 8 caractères."}
            </p>
          </div>
        </div>
        {user.authProvider === "email" && (
          <>
            <div className="dash-form-row">
              <label className="dash-form-label">Mot de passe actuel</label>
              <input type="password" className="dash-form-input" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="dash-form-row">
              <label className="dash-form-label">Nouveau mot de passe</label>
              <input type="password" className="dash-form-input" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="••••••••" minLength={8} />
            </div>
            <div className="dash-form-row">
              <label className="dash-form-label">Confirmer le nouveau mot de passe</label>
              <input type="password" className="dash-form-input" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="••••••••" />
            </div>
            {pwdError && (
              <div style={{ padding: "10px 14px", background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "8px", color: "var(--dash-danger)", fontSize: "12.5px", marginBottom: "12px" }}>{pwdError}</div>
            )}
            <button type="button" onClick={handlePasswordChange} disabled={isPending || !currentPwd || !newPwd} className="dash-btn dash-btn-ember dash-btn-sm">
              {pwdSaved ? "✓ Mot de passe modifié" : isPending ? "Modification..." : "Mettre à jour"}
            </button>
          </>
        )}
      </div>

      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Authentification à deux facteurs (2FA)</h3>
            <p className="dash-settings-card-desc">Ajoutez une couche supplémentaire de sécurité avec un code à 6 chiffres.</p>
          </div>
        </div>
        <div className="dash-toggle-row">
          <div className="dash-toggle-info">
            <div className="dash-toggle-info-title">2FA via email à chaque connexion</div>
            <div className="dash-toggle-info-desc">
              {user.twoFactorEnabled ? "Activé · Vous recevez un code à chaque connexion" : "Désactivé · Code uniquement sur nouvel appareil"}
            </div>
          </div>
          <button type="button" onClick={handleToggle2FA} disabled={isPending} className={`dash-switch ${user.twoFactorEnabled ? "active" : ""}`}></button>
        </div>
      </div>

      <div className="dash-settings-card">
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title">Sessions actives</h3>
            <p className="dash-settings-card-desc">Appareils connectés à votre compte. Déconnectez-les si nécessaire.</p>
          </div>
        </div>
        {sessions.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--dash-text-secondary)" }}>Aucune session active.</p>
        ) : (
          sessions.map((session) => {
            const ua = parseUserAgent(session.userAgent);
            return (
              <div key={session.id} className="dash-session-row">
                <div className="dash-session-icon">{ua.device === "Mobile" ? "📱" : "💻"}</div>
                <div className="dash-session-info">
                  <div className="dash-session-device">{ua.browser} · {ua.device}</div>
                  <div className="dash-session-meta">
                    {session.location || session.ipAddress || "Localisation inconnue"} · Connecté le {formatDate(session.createdAt)}
                  </div>
                </div>
                <button type="button" onClick={() => handleRevokeSession(session.id)} className="dash-btn dash-btn-ghost dash-btn-sm">Déconnecter</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function DangerTab({ user }: { user: ReglagesUser }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteAccountAction(confirmEmail);
      if (res.ok) {
        router.push("/");
      } else {
        setError(res.error || "Erreur");
      }
    });
  };

  return (
    <div className="dash-settings-section dash-animate-fade-up">
      <div className="dash-settings-card" style={{ borderColor: "rgba(220, 38, 38, 0.25)" }}>
        <div className="dash-settings-card-header">
          <div>
            <h3 className="dash-settings-card-title" style={{ color: "var(--dash-danger)" }}>Supprimer mon compte</h3>
            <p className="dash-settings-card-desc">
              Cette action est <strong>définitive</strong>. Votre boutique, produits, commandes, clients et toutes vos données seront supprimés sans possibilité de récupération.
            </p>
          </div>
        </div>

        {!showConfirm ? (
          <button type="button" onClick={() => setShowConfirm(true)} className="dash-btn dash-btn-secondary dash-btn-sm" style={{ color: "var(--dash-danger)", borderColor: "rgba(220, 38, 38, 0.35)" }}>
            Je veux supprimer mon compte
          </button>
        ) : (
          <div style={{ background: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "10px", padding: "16px" }}>
            <p style={{ fontSize: "13px", color: "var(--dash-text-primary)", marginBottom: "10px" }}>
              Pour confirmer, tapez exactement votre email : <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--dash-danger)" }}>{user.email}</strong>
            </p>
            <input type="email" className="dash-form-input" value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} placeholder="Tapez votre email exactement" style={{ marginBottom: "10px" }} />
            {error && (
              <div style={{ padding: "8px 12px", background: "rgba(220, 38, 38, 0.08)", borderRadius: "6px", fontSize: "12px", color: "var(--dash-danger)", marginBottom: "10px" }}>{error}</div>
            )}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setShowConfirm(false); setConfirmEmail(""); setError(null); }} className="dash-btn dash-btn-ghost dash-btn-sm">Annuler</button>
              <button type="button" onClick={handleDelete} disabled={isPending || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()} className="dash-btn dash-btn-secondary dash-btn-sm" style={{ color: "white", background: "var(--dash-danger)", borderColor: "var(--dash-danger)", opacity: confirmEmail.trim().toLowerCase() === user.email.toLowerCase() ? 1 : 0.5 }}>
                {isPending ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
