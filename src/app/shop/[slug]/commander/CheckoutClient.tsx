"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  Lock,
  ShoppingBag,
  Truck,
  CreditCard,
  ShieldCheck,
  Star,
  Loader2,
  Image as ImageIcon,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import {
  clearCart,
  getCart,
  updateCartQuantity,
  removeFromCart as removeCartItem,
  type CartItem,
} from "@/lib/cart";
import { useCartContext } from "@/components/shop/CartProvider";
import {
  parseShippingZones,
  shopHasPhysicalProducts,
  type ShopWithProducts,
} from "@/lib/shop-data";
import { PaymentMethodsGrid } from "@/components/icons/momo-operators";
import CountryFlag from "@/components/shared/CountryFlag";
import { createOrderAction } from "@/app/actions/order";
import {
  getOperatorsForCountry,
  normalizePhoneNumber,
} from "@/lib/cartevo/operators-catalog";
import type { CartevoOperator, CartevoCountry } from "@/lib/cartevo/types";
import {
  computeCollectFees,
  type FeeMode,
  type SelliaPlan,
} from "@/lib/cartevo/pricing";
import styles from "./checkout-onepage.module.css";
import opStyles from "./checkout.module.css";

function currencyLabel(c: string | null | undefined): string {
  return !c || c === "XAF" ? "FCFA" : c;
}

function getDialCode(code: string): string {
  const codes: Record<string, string> = {
    CM: "+237", CI: "+225", SN: "+221", BJ: "+229", TG: "+228",
    BF: "+226", ML: "+223", NE: "+227", CG: "+242", GA: "+241",
    GN: "+224", RW: "+250",
  };
  return codes[code] ?? "+237";
}

function getMomoPlaceholder(code: string): string {
  const placeholders: Record<string, string> = {
    CM: "6XX XXX XXX",
    CI: "07 XX XX XX XX",
    SN: "7X XXX XX XX",
    BJ: "9X XX XX XX",
    TG: "9X XX XX XX",
    BF: "7X XX XX XX",
    ML: "7X XX XX XX",
    NE: "9X XX XX XX",
    CG: "0X XXX XXX",
    GA: "0X XX XX XX",
    GN: "62X XX XX XX",
    RW: "78X XXX XXX",
  };
  return placeholders[code] ?? "XXX XXX XXX";
}

function isValidMomoNumber(code: string, number: string): boolean {
  const minLengths: Record<string, number> = {
    CM: 9, CI: 10, SN: 9, BJ: 8, TG: 8, BF: 8, ML: 8,
    NE: 8, CG: 9, GA: 8, GN: 9, RW: 9,
  };
  return number.length >= (minLengths[code] ?? 8);
}

type Section = "delivery" | "payment" | null;

interface Props {
  shop: ShopWithProducts;
  initialMethod: string | null;
}

export default function CheckoutClient({ shop, initialMethod }: Props) {
  const router = useRouter();
  const { refresh } = useCartContext();
  const primaryColor = shop.primaryColor ?? "#E84B1F";
  const cur = currencyLabel(shop.currency ?? "XAF");

  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [expandedSection, setExpandedSection] = useState<Section>("delivery");
  const [deliveryDone, setDeliveryDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentSubMethod] = useState<"mobile_money" | "card">("mobile_money");
  const [momoCountry, setMomoCountry] = useState<string>("CM");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoOperator, setMomoOperator] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    name: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    setMomoOperator(null);
  }, [momoCountry]);

  const zones = parseShippingZones(shop.shippingZones);
  const escrowAvail = Boolean(shop.paymentOnlineEscrow);
  const codAvail = Boolean(shop.plan === "pro" && shop.paymentCashOnDelivery);

  const defaultMethod: "cash_on_delivery" | "online_escrow" =
    initialMethod === "online_escrow" ||
    initialMethod === "cash_on_delivery"
      ? initialMethod
      : escrowAvail
        ? "online_escrow"
        : "cash_on_delivery";

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    shippingZoneId: zones[0]?.id ?? "",
    paymentMethod: defaultMethod,
  });

  useEffect(() => {
    if (escrowAvail && codAvail) return;
    if (escrowAvail && !codAvail) {
      setFormData((f) => ({ ...f, paymentMethod: "online_escrow" }));
    } else if (!escrowAvail && codAvail) {
      setFormData((f) => ({ ...f, paymentMethod: "cash_on_delivery" }));
    }
  }, [escrowAvail, codAvail]);

  useEffect(() => {
    setMounted(true);
    setItems(getCart(shop.slug));
  }, [shop.slug]);

  useEffect(() => {
    if (!mounted) return;
    if (getCart(shop.slug).length === 0) {
      router.replace(`/shop/${shop.slug}/panier`);
    }
  }, [mounted, shop.slug, router]);

  const hasPhysicalLines = shopHasPhysicalProducts(
    items.map((i) => ({
      type: i.productType && i.productType !== "" ? i.productType : "physical",
    }))
  );

  const selectedZone = zones.find((z) => z.id === formData.shippingZoneId);
  const shippingPrice =
    hasPhysicalLines && selectedZone ? selectedZone.price : 0;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingAmount =
    hasPhysicalLines && selectedZone ? shippingPrice : 0;
  const orderSubtotalBeforeDiscount =
    subtotal + shippingAmount;
  const baseTotal = Math.max(
    0,
    orderSubtotalBeforeDiscount - (appliedCoupon?.discount || 0)
  );

  const cartFeeMode = useMemo((): FeeMode => {
    const modes = items.map((item) => {
      const p = shop.products.find((pr) => pr.id === item.productId);
      return (p?.feeMode ?? "merchant_absorbs") as FeeMode;
    });
    const unique = Array.from(new Set(modes));
    if (unique.length === 1) return unique[0];
    return "merchant_absorbs";
  }, [items, shop.products]);

  const codAvailableForCart = useMemo(() => {
    if (!codAvail) return false;
    return items.every((item) => {
      const p = shop.products.find((pr) => pr.id === item.productId);
      return p?.codAvailable === true;
    });
  }, [codAvail, items, shop.products]);

  const shopPlan = (["free", "pro", "business"].includes(shop.plan)
    ? shop.plan
    : "free") as SelliaPlan;

  const collectFeesPreview =
    formData.paymentMethod === "online_escrow" &&
    momoCountry &&
    momoOperator
      ? (() => {
          try {
            return computeCollectFees({
              baseAmount: baseTotal,
              country: momoCountry,
              operator: momoOperator,
              shopPlan,
              feeMode: cartFeeMode,
            });
          } catch {
            return null;
          }
        })()
      : null;

  const total = collectFeesPreview?.customerPays ?? baseTotal;
  const paymentChoiceBoth = escrowAvail && codAvailableForCart;

  const deliveryValid =
    formData.fullName.trim().length > 1 &&
    /^\+?[0-9\s]{8,20}$/.test(formData.phone) &&
    formData.address.trim().length > 2 &&
    formData.city.trim().length > 1 &&
    (!hasPhysicalLines ||
      zones.length === 0 ||
      Boolean(formData.shippingZoneId));

  const canProceedToPayment =
    formData.paymentMethod === "cash_on_delivery" ||
    (formData.paymentMethod === "online_escrow" &&
      paymentSubMethod === "mobile_money" &&
      !!momoOperator &&
      isValidMomoNumber(momoCountry, momoNumber));

  const handleItemQtyChange = (productId: string, qty: number) => {
    setItems(updateCartQuantity(shop.slug, productId, qty));
    refresh();
  };

  const handleItemRemove = (productId: string) => {
    setItems(removeCartItem(shop.slug, productId));
    refresh();
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch(`/api/shop/${shop.slug}/apply-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
          customerPhone: formData.phone.replace(/\s/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Code invalide");
        return;
      }
      setAppliedCoupon({
        code: data.coupon.code,
        name: data.coupon.name,
        discount: data.discount,
      });
    } catch (err) {
      setCouponError(
        err instanceof Error ? err.message : "Erreur lors de la validation"
      );
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleConfirmDelivery = () => {
    if (!deliveryValid) {
      setError("Veuillez compléter vos informations de livraison.");
      return;
    }
    setError(null);
    setDeliveryDone(true);
    setExpandedSection("payment");
  };

  const handleSubmitOrder = async () => {
    if (isProcessingPayment || !canProceedToPayment) return;

    setError(null);
    if (!deliveryValid) {
      setError("Veuillez compléter toutes les informations.");
      setExpandedSection("delivery");
      return;
    }
    if (items.length === 0) {
      setError("Ton panier est vide");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const isMoMo =
        formData.paymentMethod === "online_escrow" &&
        paymentSubMethod === "mobile_money" &&
        !!momoOperator;

      const payload: Parameters<typeof createOrderAction>[0] = {
        shopSlug: shop.slug,
        customerName: formData.fullName.trim(),
        customerPhone: formData.phone,
        customerEmail: formData.email || "",
        customerCity: formData.city || "",
        customerAddress: formData.address || "",
        customerNotes: "",
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingZoneId: formData.shippingZoneId || undefined,
        paymentMethod: isMoMo
          ? "online_mobile_money"
          : formData.paymentMethod,
      };

      if (isMoMo) {
        payload.moMo = {
          country: momoCountry as CartevoCountry,
          operator: momoOperator as CartevoOperator,
          phoneNumber: normalizePhoneNumber(momoNumber, momoCountry),
        };
      }

      if (appliedCoupon) {
        payload.couponCode = appliedCoupon.code;
        payload.couponDiscount = appliedCoupon.discount;
      }

      const result = await createOrderAction(payload);

      if (!result.ok) {
        setError(result.error || "Erreur lors de la création de la commande");
        setIsProcessingPayment(false);
        return;
      }

      clearCart(shop.slug);
      refresh();
      router.push(
        `/shop/${shop.slug}/commande/${encodeURIComponent(result.order.orderNumber)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
      setIsProcessingPayment(false);
    }
  };

  if (!mounted) {
    return (
      <div className={styles.wrap}>
        <div className={styles.container} />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <div className={styles.formColumn}>
          <Link href={`/shop/${shop.slug}/panier`} className={styles.backLink}>
            ← Retour au panier
          </Link>

          <div className={styles.header}>
            <div className={styles.headerBrand}>SELLIA</div>
            <div className={styles.headerShop}>{shop.name}</div>
          </div>

          <h1 className={styles.pageTitle}>Finaliser ma commande</h1>

          {/* Livraison */}
          <div
            className={`${styles.section} ${deliveryDone ? styles.sectionDone : ""}`}
          >
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() =>
                setExpandedSection(
                  expandedSection === "delivery" ? null : "delivery"
                )
              }
            >
              <div
                className={styles.sectionNumber}
                style={{
                  background: deliveryDone ? "#16A34A" : "#0A0E13",
                }}
              >
                {deliveryDone ? <Check size={14} color="#FFF" /> : "1"}
              </div>
              <div className={styles.sectionTitleWrap}>
                <div className={styles.sectionLabel}>
                  <Truck size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Informations de livraison
                </div>
                {deliveryDone && expandedSection !== "delivery" && (
                  <div className={styles.sectionSummary}>
                    {formData.fullName} · {formData.phone} · {formData.city}
                  </div>
                )}
              </div>
              <ChevronDown
                size={18}
                className={
                  expandedSection === "delivery"
                    ? styles.chevronUp
                    : styles.chevron
                }
              />
            </button>

            {expandedSection === "delivery" && (
              <div className={styles.sectionBody}>
                <div className={styles.field}>
                  <label>Nom complet</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Jean Mballa"
                    autoComplete="name"
                  />
                </div>
                <div className={styles.field}>
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+237 6XX XXX XXX"
                    autoComplete="tel"
                  />
                </div>
                <div className={styles.field}>
                  <label>
                    Email{" "}
                    <span className={styles.optional}>
                      (optionnel — recevoir confirmation)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Votre adresse email"
                    autoComplete="email"
                  />
                </div>
                {hasPhysicalLines && zones.length > 0 && (
                  <div className={styles.field}>
                    <label>Zone de livraison</label>
                    <select
                      value={formData.shippingZoneId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shippingZoneId: e.target.value,
                        })
                      }
                    >
                      <option value="">Choisir…</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} — {z.price.toLocaleString("fr-FR")} {cur}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={styles.field}>
                  <label>Adresse de livraison</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Quartier, rue, points de repère"
                  />
                </div>
                <div className={styles.field}>
                  <label>Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Douala, Yaoundé..."
                  />
                </div>
                <button
                  type="button"
                  className={styles.sectionNextBtn}
                  style={{ background: primaryColor }}
                  onClick={handleConfirmDelivery}
                  disabled={!deliveryValid}
                >
                  Continuer vers le paiement
                </button>
              </div>
            )}
          </div>

          {/* Paiement */}
          <div className={styles.section}>
            <button
              type="button"
              className={styles.sectionHeader}
              onClick={() =>
                deliveryDone &&
                setExpandedSection(
                  expandedSection === "payment" ? null : "payment"
                )
              }
              disabled={!deliveryDone}
              style={{ opacity: deliveryDone ? 1 : 0.5 }}
            >
              <div
                className={styles.sectionNumber}
                style={{
                  background: deliveryDone ? "#0A0E13" : "#C5C2BC",
                }}
              >
                2
              </div>
              <div className={styles.sectionTitleWrap}>
                <div className={styles.sectionLabel}>
                  <CreditCard size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                  Méthode de paiement
                </div>
              </div>
              <ChevronDown
                size={18}
                className={
                  expandedSection === "payment"
                    ? styles.chevronUp
                    : styles.chevron
                }
              />
            </button>

            {expandedSection === "payment" && deliveryDone && (
              <div className={styles.sectionBody}>
                {paymentChoiceBoth && (
                  <div className={styles.paymentMethodTabs}>
                    <button
                      type="button"
                      className={`${styles.paymentTab} ${formData.paymentMethod === "online_escrow" ? styles.paymentTabActive : ""}`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          paymentMethod: "online_escrow",
                        })
                      }
                    >
                      Mobile Money
                    </button>
                    <button
                      type="button"
                      className={`${styles.paymentTab} ${formData.paymentMethod === "cash_on_delivery" ? styles.paymentTabActive : ""}`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          paymentMethod: "cash_on_delivery",
                        })
                      }
                    >
                      Paiement à la livraison
                    </button>
                  </div>
                )}

                {formData.paymentMethod === "online_escrow" && (
                  <>
                    <div className={styles.momoLogosRow}>
                      <PaymentMethodsGrid size={24} variant="compact" />
                    </div>

                    <div className={styles.field}>
                      <label>Pays</label>
                      <select
                        value={momoCountry}
                        onChange={(e) => setMomoCountry(e.target.value)}
                      >
                        <option value="CM">Cameroun</option>
                        <option value="CI">Côte d&apos;Ivoire</option>
                        <option value="SN">Sénégal</option>
                        <option value="BJ">Bénin</option>
                        <option value="TG">Togo</option>
                        <option value="BF">Burkina Faso</option>
                        <option value="ML">Mali</option>
                        <option value="NE">Niger</option>
                        <option value="CG">Congo</option>
                        <option value="GA">Gabon</option>
                        <option value="GN">Guinée</option>
                        <option value="RW">Rwanda</option>
                      </select>
                    </div>

                    <div className={opStyles.operatorSelector}>
                      <label className={opStyles.operatorSelectorLabel}>
                        Opérateur Mobile Money
                      </label>
                      <div className={opStyles.operatorGrid}>
                        {getOperatorsForCountry(momoCountry).map((op) => {
                          const isActive = momoOperator === op.code;
                          return (
                            <button
                              type="button"
                              key={op.code}
                              className={`${opStyles.operatorCard} ${isActive ? opStyles.operatorCardActive : ""}`}
                              onClick={() => setMomoOperator(op.code)}
                              style={
                                isActive
                                  ? { borderColor: op.color, color: op.color }
                                  : undefined
                              }
                            >
                              <span className={opStyles.operatorName}>
                                {op.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={opStyles.momoFieldWrap}>
                      <label className={opStyles.momoLabel}>
                        Numéro Mobile Money à débiter
                      </label>
                      <div className={opStyles.momoField}>
                        <div className={opStyles.momoCountrySelect}>
                          <div className={opStyles.momoCountryDisplay}>
                            <CountryFlag code={momoCountry as CartevoCountry} size="sm" />
                            <span>{getDialCode(momoCountry)}</span>
                          </div>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          className={opStyles.momoInput}
                          placeholder={getMomoPlaceholder(momoCountry)}
                          value={momoNumber}
                          onChange={(e) =>
                            setMomoNumber(e.target.value.replace(/[^0-9]/g, ""))
                          }
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div className={styles.protectionNote}>
                      <ShieldCheck size={14} color={primaryColor} />
                      <span>
                        Vos fonds sont protégés par Sellia jusqu&apos;à la livraison.
                      </span>
                    </div>
                  </>
                )}

                {!escrowAvail && !codAvailableForCart && (
                  <p className={styles.paymentUnavailable}>
                    Aucun moyen de paiement activé pour cette boutique.
                  </p>
                )}

                {formData.paymentMethod === "cash_on_delivery" && (
                  <div className={styles.codNotice}>
                    <Check size={14} color="#16A34A" />
                    <div>
                      <strong>Paiement à la livraison</strong>
                      <p>
                        Vous réglez {baseTotal.toLocaleString("fr-FR")} {cur}{" "}
                        directement au livreur à la réception.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          {deliveryDone && (
            <button
              type="button"
              className={styles.payBtn}
              style={{ background: primaryColor }}
              onClick={handleSubmitOrder}
              disabled={!canProceedToPayment || isProcessingPayment}
            >
              <Lock size={14} />
              {isProcessingPayment ? (
                <>
                  <Loader2 size={16} className={styles.spinIcon} />
                  Initialisation...
                </>
              ) : formData.paymentMethod === "cash_on_delivery" ? (
                `Confirmer la commande · ${total.toLocaleString("fr-FR")} ${cur}`
              ) : (
                `Payer ${total.toLocaleString("fr-FR")} ${cur}`
              )}
            </button>
          )}

          <div className={styles.secureFooter}>
            <Lock size={11} /> Paiement sécurisé · Vos fonds sont protégés jusqu&apos;à
            livraison
          </div>
        </div>

        {/* Récap sticky */}
        <div className={styles.summaryColumn}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>
              <ShoppingBag size={14} /> Votre commande
            </div>

            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={item.productId} className={styles.summaryItem}>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className={styles.summaryItemImg}
                    />
                  ) : (
                    <div className={styles.summaryItemPlaceholder}>
                      <ImageIcon size={18} />
                    </div>
                  )}
                  <div className={styles.summaryItemInfo}>
                    <div className={styles.summaryItemName}>{item.name}</div>
                    <div className={styles.summaryItemQty}>
                      ×{item.quantity}
                    </div>
                    <div className={styles.summaryQtyRow}>
                      <button
                        type="button"
                        className={styles.summaryQtyBtn}
                        onClick={() =>
                          handleItemQtyChange(
                            item.productId,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Diminuer"
                      >
                        <Minus size={11} />
                      </button>
                      <button
                        type="button"
                        className={styles.summaryQtyBtn}
                        onClick={() =>
                          handleItemQtyChange(item.productId, item.quantity + 1)
                        }
                        aria-label="Augmenter"
                      >
                        <Plus size={11} />
                      </button>
                      <button
                        type="button"
                        className={styles.summaryRemoveBtn}
                        onClick={() => handleItemRemove(item.productId)}
                        aria-label="Retirer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.summaryItemPrice}>
                    {(item.price * item.quantity).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.couponSection}>
              {!appliedCoupon ? (
                <div className={styles.couponInput}>
                  <input
                    type="text"
                    placeholder="Code promo"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    className={styles.couponInputField}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || validatingCoupon}
                    className={styles.couponApplyBtn}
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    {validatingCoupon ? "..." : "Appliquer"}
                  </button>
                </div>
              ) : (
                <div className={styles.couponApplied}>
                  <div className={styles.couponAppliedInfo}>
                    <strong>{appliedCoupon.code}</strong>
                    <span>{appliedCoupon.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className={styles.couponRemove}
                    aria-label="Retirer le code"
                  >
                    ✕
                  </button>
                </div>
              )}
              {couponError && (
                <div className={styles.couponError}>{couponError}</div>
              )}
            </div>

            <div className={styles.summarySubtotal}>
              <span>Sous-total</span>
              <span>
                {subtotal.toLocaleString("fr-FR")} {cur}
              </span>
            </div>
            {hasPhysicalLines && selectedZone && (
              <div className={styles.summarySubtotal}>
                <span>Livraison</span>
                <span>
                  {shippingAmount.toLocaleString("fr-FR")} {cur}
                </span>
              </div>
            )}
            {appliedCoupon && (
              <div className={styles.summaryDiscount}>
                <span>Réduction ({appliedCoupon.code})</span>
                <span>
                  -{appliedCoupon.discount.toLocaleString("fr-FR")} {cur}
                </span>
              </div>
            )}
            {collectFeesPreview && collectFeesPreview.totalFeesAdded > 0 && (
              <div className={styles.summaryFees}>
                <span>Frais opérateur Mobile Money</span>
                <span>
                  +{collectFeesPreview.totalFeesAdded.toLocaleString("fr-FR")}{" "}
                  {cur}
                </span>
              </div>
            )}
            <div className={styles.summaryTotal}>
              <span>Total à payer</span>
              <strong>
                {total.toLocaleString("fr-FR")} {cur}
              </strong>
            </div>
            {collectFeesPreview?.totalFeesAdded === 0 &&
              formData.paymentMethod === "online_escrow" && (
                <div className={styles.summaryNote}>
                  ✓ Aucun frais pour vous, pris en charge par le marchand.
                </div>
              )}
            {formData.paymentMethod === "cash_on_delivery" && (
              <div className={styles.summaryNote}>
                À régler en espèces à la livraison.
              </div>
            )}
          </div>

          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <Check size={12} color="#16A34A" /> Protection acheteur 6 jours
            </div>
            <div className={styles.trustBadge}>
              <Check size={12} color="#16A34A" /> Remboursement si non livré
            </div>
            <div className={styles.trustBadge}>
              <Check size={12} color="#16A34A" /> Paiement sécurisé Sellia
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
