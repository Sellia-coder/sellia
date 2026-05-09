"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Banknote,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  type CartItem,
} from "@/lib/cart";
import { useCartContext } from "./CartProvider";
import QuantityPicker from "./QuantityPicker";
import { createOrderAction } from "@/app/actions/order";
import { parseShippingZones, shopHasPhysicalProducts } from "@/lib/shop-data";
import type { ShopWithProducts } from "@/lib/shop-data";

interface Props {
  shop: ShopWithProducts;
  initialMethod: string | null;
}

export default function CartView({ shop, initialMethod }: Props) {
  const router = useRouter();
  const { refresh } = useCartContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getCart(shop.slug));
  }, [shop.slug]);

  const zones = parseShippingZones(shop.shippingZones);
  const hasPhysicalLines = shopHasPhysicalProducts(
    items.map((i) => ({
      type: i.productType && i.productType !== "" ? i.productType : "physical",
    }))
  );

  const escrowAvail = Boolean(shop.paymentOnlineEscrow);
  const codAvail = Boolean(shop.paymentCashOnDelivery);

  const defaultMethod: "cash_on_delivery" | "online_escrow" =
    initialMethod === "online_escrow" ||
    initialMethod === "cash_on_delivery"
      ? initialMethod
      : escrowAvail
        ? "online_escrow"
        : "cash_on_delivery";

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerCity: "",
    customerAddress: "",
    customerNotes: "",
    shippingZoneId: zones[0]?.id ?? "",
    paymentMethod: defaultMethod,
  });

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleQtyChange = (productId: string, qty: number) => {
    const next = updateCartQuantity(shop.slug, productId, qty);
    setItems(next);
    refresh();
  };

  const handleRemove = (productId: string) => {
    const next = removeFromCart(shop.slug, productId);
    setItems(next);
    refresh();
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const selectedZone = zones.find((z) => z.id === form.shippingZoneId);
  const shippingPrice =
    hasPhysicalLines && selectedZone ? selectedZone.price : 0;
  const total =
    subtotal +
    (showCheckout && hasPhysicalLines ? shippingPrice : 0);

  const handleCheckout = () => {
    setError(null);
    if (form.customerName.trim().length < 2) {
      setError("Renseigne ton nom complet");
      return;
    }
    if (!/^\+?[0-9\s]{8,20}$/.test(form.customerPhone)) {
      setError("Téléphone invalide");
      return;
    }
    if (hasPhysicalLines && zones.length > 0 && !form.shippingZoneId) {
      setError("Choisis une zone de livraison");
      return;
    }
    if (items.length === 0) {
      setError("Ton panier est vide");
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
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingZoneId:
          hasPhysicalLines && zones.length > 0
            ? form.shippingZoneId
            : undefined,
        paymentMethod: form.paymentMethod,
      });

      if (!result.ok) {
        setError(result.error ?? "Erreur");
        return;
      }
      clearCart(shop.slug);
      refresh();
      router.push(`/shop/${shop.slug}/commande/${result.order.orderNumber}`);
    });
  };

  if (!mounted) {
    return (
      <div className="shop-cart">
        <div className="shop-container">
          <div style={{ padding: 60, textAlign: "center" }}>
            <Loader2
              size={24}
              strokeWidth={2}
              style={{ animation: "shopSpin 0.7s linear infinite" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <section className="shop-cart">
        <div className="shop-container shop-cart-inner">
          <Link href={`/shop/${shop.slug}`} className="shop-order-back">
            <ArrowLeft size={14} strokeWidth={2} />
            Continuer mes achats
          </Link>
          <div className="shop-cart-empty">
            <div className="shop-cart-empty-icon">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <h1>Ton panier est vide</h1>
            <p>Découvre nos produits et fais-toi plaisir !</p>
            <Link
              href={`/shop/${shop.slug}`}
              className="shop-btn shop-btn-primary shop-btn-lg"
            >
              Découvrir la boutique
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="shop-cart">
      <div className="shop-container shop-cart-inner">
        <Link href={`/shop/${shop.slug}`} className="shop-order-back">
          <ArrowLeft size={14} strokeWidth={2} />
          Continuer mes achats
        </Link>

        <h1 className="shop-cart-title">
          {showCheckout ? "Finaliser ma commande" : "Mon panier"}
        </h1>

        <div className="shop-cart-grid">
          <div className="shop-cart-main">
            {!showCheckout && (
              <div className="shop-cart-items">
                {items.map((item) => (
                  <div className="shop-cart-item" key={item.productId}>
                    <Link
                      href={`/shop/${shop.slug}/produit/${item.productSlug}`}
                      className="shop-cart-item-img"
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <span>{item.emoji ?? "🛍️"}</span>
                      )}
                    </Link>
                    <div className="shop-cart-item-info">
                      <Link
                        href={`/shop/${shop.slug}/produit/${item.productSlug}`}
                        className="shop-cart-item-name"
                      >
                        {item.name}
                      </Link>
                      <div className="shop-cart-item-unit">
                        {item.price.toLocaleString("fr-FR")} FCFA / unité
                      </div>
                      <div className="shop-cart-item-controls">
                        <QuantityPicker
                          value={item.quantity}
                          onChange={(q) => handleQtyChange(item.productId, q)}
                        />
                        <button
                          type="button"
                          className="shop-cart-item-remove"
                          onClick={() => handleRemove(item.productId)}
                          aria-label="Retirer"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <div className="shop-cart-item-line-total">
                      {(item.price * item.quantity).toLocaleString("fr-FR")}{" "}
                      FCFA
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showCheckout && (
              <div className="shop-cart-checkout">
                <div className="shop-form-section">
                  <h2 className="shop-form-section-title">Tes coordonnées</h2>
                  <div className="shop-form-row">
                    <label className="shop-form-label">Nom complet *</label>
                    <input
                      type="text"
                      value={form.customerName}
                      onChange={(e) =>
                        updateField("customerName", e.target.value)
                      }
                      className="shop-input"
                      placeholder="Marie Ngono"
                    />
                  </div>
                  <div className="shop-form-row">
                    <label className="shop-form-label">
                      Téléphone WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={form.customerPhone}
                      onChange={(e) =>
                        updateField("customerPhone", e.target.value)
                      }
                      className="shop-input"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                  <div className="shop-form-row">
                    <label className="shop-form-label">
                      Email{" "}
                      <span className="shop-form-optional">(optionnel)</span>
                    </label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(e) =>
                        updateField("customerEmail", e.target.value)
                      }
                      className="shop-input"
                    />
                  </div>
                </div>

                {hasPhysicalLines && zones.length > 0 && (
                  <div className="shop-form-section">
                    <h2 className="shop-form-section-title">Livraison</h2>
                    <div className="shop-form-row">
                      <label className="shop-form-label">Zone *</label>
                      <select
                        value={form.shippingZoneId}
                        onChange={(e) =>
                          updateField("shippingZoneId", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateField("customerCity", e.target.value)
                        }
                        className="shop-input"
                      />
                    </div>
                    <div className="shop-form-row">
                      <label className="shop-form-label">Adresse précise</label>
                      <input
                        type="text"
                        value={form.customerAddress}
                        onChange={(e) =>
                          updateField("customerAddress", e.target.value)
                        }
                        className="shop-input"
                      />
                    </div>
                  </div>
                )}

                <div className="shop-form-section">
                  <h2 className="shop-form-section-title">Mode de paiement</h2>
                  <div className="shop-payment-radios">
                    {escrowAvail && (
                      <label
                        className={`shop-payment-radio ${
                          form.paymentMethod === "online_escrow"
                            ? "is-active"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          checked={form.paymentMethod === "online_escrow"}
                          onChange={() =>
                            updateField("paymentMethod", "online_escrow")
                          }
                        />
                        <div className="shop-payment-radio-content">
                          <div className="shop-payment-radio-title">
                            <ShieldCheck size={16} strokeWidth={2} />
                            Paiement en ligne sécurisé
                          </div>
                          <div className="shop-payment-radio-desc">
                            Tu paies maintenant, fonds protégés par Sellia.
                          </div>
                        </div>
                      </label>
                    )}
                    {codAvail && (
                      <label
                        className={`shop-payment-radio ${
                          form.paymentMethod === "cash_on_delivery"
                            ? "is-active"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          checked={form.paymentMethod === "cash_on_delivery"}
                          onChange={() =>
                            updateField("paymentMethod", "cash_on_delivery")
                          }
                        />
                        <div className="shop-payment-radio-content">
                          <div className="shop-payment-radio-title">
                            <Banknote size={16} strokeWidth={2} />
                            Paiement à la livraison
                          </div>
                          <div className="shop-payment-radio-desc">
                            Paie en espèces ou Mobile Money à la réception.
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="shop-form-section">
                  <div className="shop-form-row">
                    <label className="shop-form-label">
                      Notes{" "}
                      <span className="shop-form-optional">(optionnel)</span>
                    </label>
                    <textarea
                      value={form.customerNotes}
                      onChange={(e) =>
                        updateField("customerNotes", e.target.value)
                      }
                      className="shop-input shop-textarea"
                      rows={3}
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
            )}
          </div>

          <aside className="shop-order-summary">
            <div className="shop-order-summary-card">
              <h2 className="shop-order-summary-title">Récapitulatif</h2>

              <div className="shop-order-summary-lines">
                <div className="shop-order-summary-line">
                  <span>
                    {items.length} article{items.length > 1 ? "s" : ""}
                  </span>
                  <span>{subtotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
                {showCheckout && hasPhysicalLines && (
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

              {!showCheckout ? (
                <button
                  type="button"
                  className="shop-btn shop-btn-primary shop-btn-lg shop-btn-full"
                  onClick={() => setShowCheckout(true)}
                >
                  Passer à la commande
                </button>
              ) : (
                <button
                  type="button"
                  className="shop-btn shop-btn-primary shop-btn-lg shop-btn-full"
                  onClick={handleCheckout}
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
                      Envoi…
                    </>
                  ) : (
                    "Confirmer la commande"
                  )}
                </button>
              )}

              <p className="shop-order-summary-trust">
                <ShieldCheck size={12} strokeWidth={2} />
                Paiement 100% sécurisé
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
