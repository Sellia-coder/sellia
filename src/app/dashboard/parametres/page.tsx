import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function ParametresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: { plan: true },
  });

  const planLabel = shop?.plan === "pro" ? "Pro" : "Découverte";
  const planColor = shop?.plan === "pro" ? "warning" : "neutral";

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <Link href="/dashboard" className="dash-back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Retour au dashboard
          </Link>
          <div className="dash-page-eyebrow">— Compte</div>
          <h1 className="dash-page-title">Paramètres du compte</h1>
          <p className="dash-page-subtitle">Gérez votre plan, vos préférences et la sécurité de votre compte.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "8px" }} className="dash-animate-fade-up dash-animate-delay-1">
        <Link href="/dashboard/parametres/abonnement" className="dash-settings-card" style={{ textDecoration: "none", display: "block", transition: "all 0.2s", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(232, 75, 31, 0.12), rgba(232, 75, 31, 0.04))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dash-ember)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <span className={`dash-badge dash-badge-${planColor}`}><span className="dash-badge-dot"></span>{planLabel}</span>
          </div>
          <h3 className="dash-settings-card-title" style={{ marginBottom: "6px" }}>Plan & Facturation</h3>
          <p className="dash-settings-card-desc" style={{ margin: 0 }}>Votre plan actuel, l&apos;historique de paiement et la gestion de votre abonnement.</p>
        </Link>

        <Link href="/dashboard/reglages?tab=profil" className="dash-settings-card" style={{ textDecoration: "none", display: "block", transition: "all 0.2s", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.04))", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
          </div>
          <h3 className="dash-settings-card-title" style={{ marginBottom: "6px" }}>Profil & Préférences</h3>
          <p className="dash-settings-card-desc" style={{ margin: 0 }}>Vos informations personnelles, votre boutique, vos notifications et préférences.</p>
        </Link>

        <Link href="/dashboard/reglages?tab=securite" className="dash-settings-card" style={{ textDecoration: "none", display: "block", transition: "all 0.2s", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04))", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
          </div>
          <h3 className="dash-settings-card-title" style={{ marginBottom: "6px" }}>Sécurité</h3>
          <p className="dash-settings-card-desc" style={{ margin: 0 }}>Mot de passe, authentification à deux facteurs et sessions actives sur vos appareils.</p>
        </Link>
      </div>
    </>
  );
}
