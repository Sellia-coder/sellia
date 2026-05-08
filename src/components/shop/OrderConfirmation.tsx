"use client";

import { CheckCircle2, MessageCircle, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  order: {
    orderNumber: string;
    customerName: string;
    total: number;
    paymentMethod: string;
    items: unknown;
  };
  shop: {
    slug: string;
    name: string;
    whatsappNumber: string | null;
  };
}

export default function OrderConfirmation({ order, shop }: Props) {
  const isOnline = order.paymentMethod === "online_escrow";
  const waNumber = shop.whatsappNumber?.replace(/[^0-9]/g, "") ?? "";
  const waMessage = encodeURIComponent(
    `Bonjour, je viens de passer la commande ${order.orderNumber} sur ta boutique ${shop.name}. Total : ${order.total.toLocaleString("fr-FR")} FCFA.`
  );
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null;
  const firstName = order.customerName.trim().split(/\s+/)[0] ?? order.customerName;

  return (
    <section className="shop-confirmation">
      <div className="shop-container shop-confirmation-inner">
        <div className="shop-confirmation-icon">
          <CheckCircle2 size={48} strokeWidth={1.6} />
        </div>
        <h1 className="shop-confirmation-title">Commande reçue</h1>
        <p className="shop-confirmation-subtitle">
          Merci {firstName} ! Le vendeur a bien reçu ta commande et te contactera
          très bientôt.
        </p>

        <div className="shop-confirmation-card">
          <div className="shop-confirmation-row">
            <span className="shop-confirmation-label">Numéro de commande</span>
            <span className="shop-confirmation-value shop-mono">
              {order.orderNumber}
            </span>
          </div>
          <div className="shop-confirmation-row">
            <span className="shop-confirmation-label">Total</span>
            <span className="shop-confirmation-value">
              {order.total.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
          <div className="shop-confirmation-row">
            <span className="shop-confirmation-label">Paiement</span>
            <span className="shop-confirmation-value">
              {isOnline ? "En ligne sécurisé" : "À la livraison"}
            </span>
          </div>

          {isOnline && (
            <div className="shop-confirmation-info">
              Le vendeur va te contacter sur WhatsApp pour finaliser le paiement
              en ligne. Une fois le paiement reçu, ta commande sera préparée.
            </div>
          )}

          {!isOnline && (
            <div className="shop-confirmation-info">
              Le vendeur va te contacter sur WhatsApp pour confirmer la commande et
              organiser la livraison. Tu paieras à la livraison.
            </div>
          )}
        </div>

        <div className="shop-confirmation-actions">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-btn shop-btn-whatsapp shop-btn-lg"
            >
              <MessageCircle size={16} strokeWidth={2} />
              Contacter le vendeur
            </a>
          )}
          <Link href={`/shop/${shop.slug}`} className="shop-btn shop-btn-secondary shop-btn-lg">
            <Home size={16} strokeWidth={2} />
            Retour à la boutique
          </Link>
        </div>
      </div>
    </section>
  );
}
