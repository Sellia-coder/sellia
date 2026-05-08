"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Banknote,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createOrderAction } from "@/app/actions/order";
import { parseShippingZones } from "@/lib/shop-data";

interface Props {
  shop: {
    id: string;
    slug: string;
    whatsappNumber: string | null;
    paymentCashOnDelivery: boolean;
    paymentOnlineEscrow: boolean;
    shippingZones: unknown;
  };
  product: {
    id: string;
    slug: string | null;
    name: string;
    price: number;
    type: string;
    imageUrl: string | null;
    emoji: string | null;
  };
}

export default function OrderForm({ shop, product }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPhysical = product.type === "physical";
  const zones = parseShippingZones(shop.shippingZones);
  const needsShipping = isPhysical && zones.length > 0;

  const qp = searchParams.get("method");

  function resolvePaymentMethod(queryMethod: string | null): "cash_on_delivery" | "online_escrow" {
    if (queryMethod === "cash_on_delivery" && shop.paymentCashOnDelivery) return "cash_on_delivery";
    if (queryMethod === "online_escrow" && shop.paymentOnlineEscrow) return "online_escrow";
    if (shop.paymentOnlineEscrow) return "online_escrow";
    return "cash_on_delivery";
  }

  const initialMethod = resolvePaymentMethod(qp);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerCity: "",
    customerAddress: "",
    customerNotes: "",
    quantity: 1,
    shippingZoneId: zones[0]?.id ?? "",
    paymentMethod: initialMethod as "cash_on_delivery" | "online_escrow",
  });

  const selectedZone = zones.find((z) => z.id === form.shippingZoneId);
  const subtotal = product.price * form.quantity;
  const shippingPrice = needsShipping && selectedZone ? selectedZone.price : 0;
  const total = subtotal + shippingPrice;

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const productSegment = product.slug ?? product.id;

  const handleSubmit = () => {
    setError(null);
    if (form.customerName.trim().length < 2) {
      setError("Renseigne ton nom complet");
      return;
    }
    if (!/^\+?[0-9\s]{8,20}$/.test(form.customerPhone)) {
      setError("Téléphone invalide");
      return;
    }
    if (needsShipping && !form.shippingZoneId) {
      setError("Choisis une zone de livraison");
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        shopSlug: shop.slug,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || undefined,
        customerCity: form.customerCity || undefined,
        customerAddress: form.customerAddress || undefined,
        customerNotes: form.customerNotes || undefined,
        items: [{ productId: product.id, quantity: form.quantity }],
        shippingZoneId: needsShipping ? form.shippingZoneId : undefined,
        paymentMethod: form.paymentMethod,
      });

      if (!result.ok) {
        setError(result.error ?? "Une erreur est survenue");
        return;
      }
      router.push(`/shop/${shop.slug}/commande/${result.order.orderNumber}`);
    });
  };

  return (
    <section className="shop-order">
      <div className="shop-container shop-order-inner">
        <Link href={`/shop/${shop.slug}/produit/${productSegment}`} className="shop-order-back">
          <ArrowLeft size={14} strokeWidth={2} />
          Retour au produit
        </Link>

        <div className="shop-order-grid">
          <div className="shop-order-form">
            <h1 className="shop-order-title">Finaliser ta commande</h1>

            <div className="shop-form-section">
              <h2 className="shop-form-section-title">Tes coordonnées</h2>
              <div className="shop-form-row">
                <label className="shop-form-label">Nom complet *</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  placeholder="Ex : Marie Ngono"
                  className="shop-input"
                />
              </div>
              <div className="shop-form-row">
                <label className="shop-form-label">Téléphone WhatsApp *</label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => update("customerPhone", e.target.value)}
                  placeholder="+237 6XX XXX XXX"
                  className="shop-input"
                />
              </div>
              <div className="shop-form-row">
                <label className="shop-form-label">
                  Email <span className="shop-form-optional">(optionnel)</span>
                </label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => update("customerEmail", e.target.value)}
                  placeholder="ex@email.com"
                  className="shop-input"
                />
              </div>
            </div>

            {needsShipping && (
              <div className="shop-form-section">
                <h2 className="shop-form-section-title">Livraison</h2>
                <div className="shop-form-row">
                  <label className="shop-form-label">Zone *</label>
                  <select
                    value={form.shippingZoneId}
                    onChange={(e) => update("shippingZoneId", e.target.value)}
                    className="shop-input"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {z.price.toLocaleString("fr-FR")} FCFA
                        {z.eta ? ` (${z.eta})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="shop-form-row">
                  <label className="shop-form-label">Ville</label>
                  <input
                    type="text"
                    value={form.customerCity}
                    onChange={(e) => update("customerCity", e.target.value)}
                    placeholder="Ex : Douala"
                    className="shop-input"
                  />
                </div>
                <div className="shop-form-row">
                  <label className="shop-form-label">Adresse précise</label>
                  <input
                    type="text"
                    value={form.customerAddress}
                    onChange={(e) => update("customerAddress", e.target.value)}
                    placeholder="Ex : Akwa, près du carrefour…"
                    className="shop-input"
                  />
                </div>
              </div>
            )}

            <div className="shop-form-section">
              <h2 className="shop-form-section-title">Mode de paiement</h2>
              <div className="shop-payment-radios">
                {shop.paymentOnlineEscrow && (
                  <label
                    className={`shop-payment-radio ${
                      form.paymentMethod === "online_escrow" ? "is-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={form.paymentMethod === "online_escrow"}
                      onChange={() => update("paymentMethod", "online_escrow")}
                    />
                    <div className="shop-payment-radio-content">
                      <div className="shop-payment-radio-title">
                        <ShieldCheck size={16} strokeWidth={2} />
                        Paiement en ligne sécurisé
                      </div>
                      <div className="shop-payment-radio-desc">
                        Tu paies maintenant, fonds sécurisés par Sellia.
                      </div>
                    </div>
                  </label>
                )}
                {shop.paymentCashOnDelivery && (
                  <label
                    className={`shop-payment-radio ${
                      form.paymentMethod === "cash_on_delivery" ? "is-active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={form.paymentMethod === "cash_on_delivery"}
                      onChange={() => update("paymentMethod", "cash_on_delivery")}
                    />
                    <div className="shop-payment-radio-content">
                      <div className="shop-payment-radio-title">
                        <Banknote size={16} strokeWidth={2} />
                        Paiement à la livraison
                      </div>
                      <div className="shop-payment-radio-desc">
                        Tu paies en espèces ou Mobile Money à la réception.
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div className="shop-form-section">
              <div className="shop-form-row">
                <label className="shop-form-label">
                  Notes <span className="shop-form-optional">(optionnel)</span>
                </label>
                <textarea
                  value={form.customerNotes}
                  onChange={(e) => update("customerNotes", e.target.value)}
                  placeholder="Précisions sur la livraison, taille, couleur…"
                  className="shop-input shop-textarea"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>

            {error && (
              <div className="shop-alert-error">
                <AlertCircle size={14} strokeWidth={2} />
                {error}
              </div>
            )}
          </div>

          <aside className="shop-order-summary">
            <div className="shop-order-summary-card">
              <h2 className="shop-order-summary-title">Récapitulatif</h2>

              <div className="shop-order-summary-product">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" />
                ) : (
                  <span>{product.emoji ?? "🛍️"}</span>
                )}
                <div>
                  <div className="shop-order-summary-product-name">{product.name}</div>
                  <div className="shop-order-summary-product-meta">
                    Quantité :
                    <select
                      value={form.quantity}
                      onChange={(e) => update("quantity", parseInt(e.target.value, 10))}
                      className="shop-order-quantity-select"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="shop-order-summary-lines">
                <div className="shop-order-summary-line">
                  <span>Sous-total</span>
                  <span>{subtotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                {needsShipping && (
                  <div className="shop-order-summary-line">
                    <span>Livraison</span>
                    <span>{shippingPrice.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                )}
                <div className="shop-order-summary-line shop-order-summary-line-total">
                  <span>Total</span>
                  <span>{total.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              <button
                type="button"
                className="shop-btn shop-btn-primary shop-btn-lg shop-btn-full"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2
                      size={16}
                      strokeWidth={2}
                      style={{
                        animation: "shopSpin 0.7s linear infinite",
                      }}
                    />
                    Envoi en cours…
                  </>
                ) : (
                  "Confirmer la commande"
                )}
              </button>

              <p className="shop-order-summary-trust">
                <ShieldCheck size={12} strokeWidth={2} />
                Tes données sont protégées
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
