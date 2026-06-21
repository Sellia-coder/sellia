"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTicketAction } from "@/app/actions/support";
import {
  Wrench,
  ShoppingBag,
  CurrencyCircleDollar,
  Storefront,
  Lightbulb,
  ChatCircle,
  ArrowLeft,
  PaperPlaneTilt,
  CheckCircle,
  Clock,
  Lightning,
  Warning,
  FileText,
} from "@phosphor-icons/react";

const CATEGORIES = [
  { value: "TECHNICAL", label: "Technique", desc: "Bug, erreur, problème technique", Icon: Wrench, color: "#2563eb" },
  { value: "ORDER", label: "Commande", desc: "Question sur une commande spécifique", Icon: ShoppingBag, color: "#0891b2" },
  { value: "PAYMENT", label: "Paiement", desc: "Mobile Money, payout, transaction", Icon: CurrencyCircleDollar, color: "#16a34a" },
  { value: "SHOP", label: "Boutique", desc: "Configuration, apparence, domaine", Icon: Storefront, color: "#E84B1F" },
  { value: "SUGGESTION", label: "Suggestion", desc: "Idée ou amélioration", Icon: Lightbulb, color: "#f59e0b" },
  { value: "OTHER", label: "Autre", desc: "Toute autre demande", Icon: ChatCircle, color: "#6b7280" },
] as const;

const PRIORITIES = [
  { value: "LOW", label: "Basse", desc: "Pas pressé, à traiter quand possible", Icon: Clock, color: "#6b7280" },
  { value: "NORMAL", label: "Normale", desc: "Réponse sous 24h ouvrées", Icon: CheckCircle, color: "#2563eb" },
  { value: "HIGH", label: "Élevée", desc: "Bloquant pour mon activité", Icon: Lightning, color: "#E84B1F" },
  { value: "URGENT", label: "Urgente", desc: "Impact critique en production", Icon: Warning, color: "#dc2626" },
] as const;

interface Props {
  userName: string;
  userEmail: string;
  shopName: string | null;
}

export default function NouveauTicketClient({ userName, userEmail, shopName }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["value"]>("OTHER");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]["value"]>("NORMAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    if (!subject.trim() || subject.trim().length < 3) {
      setError("Le sujet doit faire au moins 3 caractères");
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setError("Le message doit faire au moins 5 caractères");
      return;
    }

    startTransition(async () => {
      const res = await createTicketAction({ subject, category, priority, message });
      if (res.ok && res.ticketId) {
        router.push(`/dashboard/aide?ticket=${res.ticketId}`);
      } else {
        setError(res.error || "Erreur lors de la création du ticket");
      }
    });
  };

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <Link href="/dashboard/aide" className="dash-back-link">
            <ArrowLeft size={14} weight="bold" />
            Retour aux tickets
          </Link>
          <div className="dash-page-eyebrow">— Support</div>
          <h1 className="dash-page-title">Nouveau ticket</h1>
          <p className="dash-page-subtitle">Décrivez votre demande en détail. Notre équipe vous répond sous 24h ouvrées.</p>
        </div>
      </div>

      <div className="dash-animate-fade-up dash-animate-delay-1 dash-aide-form-layout">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Catégorie</h3>
                <p className="dash-settings-card-desc">Aidez-nous à diriger votre ticket vers le bon expert.</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    style={{
                      padding: "14px",
                      background: isActive ? "rgba(232, 75, 31, 0.06)" : "white",
                      border: `1.5px solid ${isActive ? "var(--dash-ember)" : "var(--dash-border)"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "10px",
                      background: isActive ? `${cat.color}1A` : `${cat.color}10`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: cat.color, flexShrink: 0,
                    }}>
                      <cat.Icon size={22} weight="duotone" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--dash-text-primary)", marginBottom: "2px" }}>{cat.label}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--dash-text-secondary)", lineHeight: 1.3 }}>{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Priorité</h3>
                <p className="dash-settings-card-desc">Évaluez l&apos;urgence de votre demande de manière honnête.</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px" }}>
              {PRIORITIES.map((p) => {
                const isActive = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    style={{
                      padding: "12px",
                      background: isActive ? `${p.color}10` : "white",
                      border: `1.5px solid ${isActive ? p.color : "var(--dash-border)"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <p.Icon size={20} weight="duotone" color={p.color} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--dash-text-primary)" }}>{p.label}</div>
                      <div style={{ fontSize: "11px", color: "var(--dash-text-secondary)" }}>{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="dash-settings-card">
            <div className="dash-settings-card-header">
              <div>
                <h3 className="dash-settings-card-title">Votre demande</h3>
                <p className="dash-settings-card-desc">Soyez précis et détaillé pour une réponse plus rapide.</p>
              </div>
            </div>

            <div className="dash-form-row">
              <label className="dash-form-label">Sujet</label>
              <input
                type="text"
                className="dash-form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Impossible de configurer Mobile Money MTN"
                maxLength={200}
              />
              <div style={{ fontSize: "11px", color: "var(--dash-text-secondary)", textAlign: "right", marginTop: "4px" }}>{subject.length}/200</div>
            </div>

            <div className="dash-form-row">
              <label className="dash-form-label">Message détaillé</label>
              <textarea
                className="dash-form-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre situation : ce que vous essayez de faire, ce qui se passe, les messages d'erreur éventuels, et toute information utile pour notre équipe."
                rows={10}
                maxLength={5000}
                style={{ minHeight: "200px" }}
              />
              <div style={{ fontSize: "11px", color: "var(--dash-text-secondary)", textAlign: "right", marginTop: "4px" }}>{message.length}/5000</div>
            </div>

            {error && (
              <div style={{
                padding: "12px 14px", background: "rgba(220, 38, 38, 0.06)",
                border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "10px",
                color: "var(--dash-danger)", fontSize: "13px",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <Warning size={18} weight="duotone" />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
              <Link href="/dashboard/aide" className="dash-btn dash-btn-ghost dash-btn-sm">
                Annuler
              </Link>
              <button type="button" onClick={handleSubmit} disabled={isPending} className="dash-btn dash-btn-ember dash-btn-sm">
                {isPending ? "Envoi..." : (
                  <>
                    Envoyer le ticket
                    <PaperPlaneTilt size={14} weight="bold" style={{ marginLeft: "6px" }} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "sticky", top: "20px" }}>
          <div className="dash-settings-card">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(232, 75, 31, 0.12), rgba(232, 75, 31, 0.04))",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--dash-ember)",
              }}>
                <FileText size={22} weight="duotone" />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--dash-text-secondary)", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>Demande de</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--dash-text-primary)" }}>{userName}</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--dash-border)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--dash-text-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Email</span>
                <span style={{ color: "var(--dash-text-primary)" }}>{userEmail}</span>
              </div>
              {shopName && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Boutique</span>
                  <span style={{ color: "var(--dash-text-primary)", fontWeight: 500 }}>{shopName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="dash-settings-card" style={{ background: "linear-gradient(135deg, var(--dash-bg-active), rgba(232, 75, 31, 0.02))", borderColor: "rgba(232, 75, 31, 0.15)" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600, color: "var(--dash-ember)", marginBottom: "10px" }}>
              Conseils
            </div>
            <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--dash-text-primary)", lineHeight: 1.5 }}>
              <li>Précisez les étapes que vous avez suivies</li>
              <li>Indiquez les messages d&apos;erreur exacts</li>
              <li>Mentionnez le navigateur si bug visuel</li>
              <li>Joignez le numéro de commande si concernée</li>
            </ul>
          </div>

          <div style={{ padding: "14px 16px", background: "rgba(34, 197, 94, 0.06)", border: "1px solid rgba(34, 197, 94, 0.15)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle size={22} weight="duotone" color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#15803d" }}>Réponse sous 24h ouvrées</div>
              <div style={{ fontSize: "11px", color: "#16a34a" }}>Notre équipe support FR/EN</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
