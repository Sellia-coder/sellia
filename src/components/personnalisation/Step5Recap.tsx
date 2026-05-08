"use client";

import type { ReactNode } from "react";
import {
  COUNTRIES,
  type Step1Input,
  type Step2Input,
  type Step3Input,
  type Step35Input,
  type Step4Input,
} from "@/lib/validations/personnalisation";
import {
  Sparkles,
  Package,
  Phone,
  FileText,
  Pencil,
  Mail,
  MapPin,
  Rocket,
  ArrowLeft,
  Truck,
  Banknote,
  ShieldCheck,
} from "lucide-react";

interface Props {
  step1: Step1Input;
  step2: Step2Input;
  step3: Step3Input;
  step35: Step35Input | null;
  step4: Step4Input;
  draft: { name: string | null; primaryColor: string | null };
  isPublishing: boolean;
  onPublish: () => void;
  onBack: () => void;
  onEditStep: (s: number) => void;
}

export default function Step5Recap({
  step1,
  step2,
  step3,
  step35,
  step4,
  draft,
  isPublishing,
  onPublish,
  onBack,
  onEditStep,
}: Props) {
  const country = COUNTRIES.find((c) => c.code === step3.country);
  const includedProducts = step2.products.filter((p) => p.included);
  const initial = (draft.name?.[0] ?? "S").toUpperCase();
  const primaryColor = draft.primaryColor ?? "#E84B1F";

  return (
    <section>
      <div className="perso-section-header">
        <h1 className="perso-title">Tout est prêt</h1>
        <p className="perso-subtitle">Vérifie une dernière fois avant de mettre ta boutique en ligne.</p>
      </div>

      <RecapCard icon={<Sparkles size={14} strokeWidth={2} />} title="Identité" onEdit={() => onEditStep(1)}>
        <div className="perso-recap-identity">
          <div
            className="perso-recap-identity-logo"
            style={{ background: step1.logoUrl ? "transparent" : primaryColor }}
          >
            {step1.logoUrl ? (
              <img src={step1.logoUrl} alt="" />
            ) : (
              <span className="perso-recap-identity-initial">{initial}</span>
            )}
          </div>
          <div>
            <div className="perso-recap-identity-name">{draft.name}</div>
            <div className="perso-recap-identity-slug">{step1.slug}.getsellia.com</div>
          </div>
        </div>
      </RecapCard>

      <RecapCard
        icon={<Package size={14} strokeWidth={2} />}
        title={`${includedProducts.length} produit${includedProducts.length > 1 ? "s" : ""}`}
        onEdit={() => onEditStep(2)}
      >
        <ul className="perso-recap-list">
          {includedProducts.slice(0, 5).map((p) => (
            <li key={p.id}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{p.emoji || "🛍️"}</span>
                <span>{p.name}</span>
              </span>
              <span className="perso-recap-list-price">{p.price.toLocaleString("fr-FR")} FCFA</span>
            </li>
          ))}
          {includedProducts.length > 5 && (
            <li style={{ fontSize: 12, color: "#8B8E94" }}>
              + {includedProducts.length - 5} autre{includedProducts.length - 5 > 1 ? "s" : ""}
            </li>
          )}
        </ul>
      </RecapCard>

      <RecapCard icon={<Phone size={14} strokeWidth={2} />} title="Contact" onEdit={() => onEditStep(3)}>
        <ul className="perso-recap-list">
          <li>
            <span className="perso-recap-list-icon">
              <Phone size={14} strokeWidth={2} />
              {step3.whatsappNumber}
            </span>
          </li>
          <li>
            <span className="perso-recap-list-icon">
              <Mail size={14} strokeWidth={2} />
              {step3.contactEmail}
            </span>
          </li>
          <li>
            <span className="perso-recap-list-icon">
              <MapPin size={14} strokeWidth={2} />
              {step3.city}, {country?.flag} {country?.name}
            </span>
          </li>
        </ul>
      </RecapCard>

      {step35 && (
        <>
          <RecapCard
            icon={<Truck size={14} strokeWidth={2} />}
            title="Livraison"
            onEdit={() => onEditStep(35)}
          >
            <ul className="perso-recap-list">
              {step35.shippingZones.slice(0, 4).map((z) => (
                <li key={z.id}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{z.name}</span>
                    {z.eta && (
                      <span style={{ fontSize: 11, color: "#8B8E94" }}>
                        · {z.eta}
                      </span>
                    )}
                  </span>
                  <span className="perso-recap-list-price">
                    {z.price.toLocaleString("fr-FR")} FCFA
                  </span>
                </li>
              ))}
              {step35.shippingZones.length > 4 && (
                <li style={{ fontSize: 12, color: "#8B8E94" }}>
                  + {step35.shippingZones.length - 4} autre
                  {step35.shippingZones.length - 4 > 1 ? "s" : ""} zone
                  {step35.shippingZones.length - 4 > 1 ? "s" : ""}
                </li>
              )}
            </ul>
          </RecapCard>

          <RecapCard
            icon={<Banknote size={14} strokeWidth={2} />}
            title="Paiement"
            onEdit={() => onEditStep(35)}
          >
            <ul className="perso-recap-list">
              {step35.paymentCashOnDelivery && (
                <li>
                  <span className="perso-recap-list-icon">
                    <Banknote size={14} strokeWidth={2} />
                    Paiement à la livraison
                  </span>
                </li>
              )}
              {step35.paymentOnlineEscrow && (
                <li>
                  <span className="perso-recap-list-icon">
                    <ShieldCheck size={14} strokeWidth={2} />
                    Paiement en ligne sécurisé (escrow QR)
                  </span>
                </li>
              )}
            </ul>
          </RecapCard>
        </>
      )}

      <RecapCard icon={<FileText size={14} strokeWidth={2} />} title="À propos" onEdit={() => onEditStep(4)}>
        <p className="perso-recap-text">{step4.description}</p>
      </RecapCard>

      <div className="perso-recap-actions">
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="perso-btn perso-btn-primary perso-btn-primary-large perso-btn-icon"
        >
          {isPublishing ? (
            <>
              <span className="perso-spinner" />
              Publication en cours…
            </>
          ) : (
            <>
              <Rocket size={18} strokeWidth={2} />
              Publier ma boutique
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={isPublishing}
          className="perso-btn perso-btn-secondary perso-btn-secondary-large perso-btn-icon"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Retour
        </button>
      </div>
    </section>
  );
}

function RecapCard({
  icon,
  title,
  children,
  onEdit,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="perso-recap-card">
      <div className="perso-recap-header">
        <h2 className="perso-recap-title perso-recap-title-icon">
          {icon}
          {title}
        </h2>
        <button type="button" onClick={onEdit} className="perso-recap-edit perso-btn-icon">
          <Pencil size={11} strokeWidth={2} />
          Modifier
        </button>
      </div>
      {children}
    </div>
  );
}
