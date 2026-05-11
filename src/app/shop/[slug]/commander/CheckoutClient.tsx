"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Check,
} from "lucide-react";
import {
  clearCart,
  getCart,
  type CartItem,
} from "@/lib/cart";
import { useCartContext } from "@/components/shop/CartProvider";
import { createOrderAction } from "@/app/actions/order";
import {
  parseShippingZones,
  shopHasPhysicalProducts,
  type ShopWithProducts,
} from "@/lib/shop-data";
import styles from "./checkout.module.css";

function currencyLabel(c: string | null | undefined): string {
  return !c || c === "XAF" ? "FCFA" : c;
}

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
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);

  const zones = parseShippingZones(shop.shippingZones);
  const escrowAvail = Boolean(shop.paymentOnlineEscrow);
  const codAvail = Boolean(shop.paymentCashOnDelivery);

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
    const cart = getCart(shop.slug);
    if (cart.length === 0 && currentStep < 4) {
      router.replace(`/shop/${shop.slug}/panier`);
    }
  }, [mounted, shop.slug, router, currentStep]);

  const hasPhysicalLines = shopHasPhysicalProducts(
    items.map((i) => ({
      type: i.productType && i.productType !== "" ? i.productType : "physical",
    }))
  );

  const selectedZone = zones.find((z) => z.id === formData.shippingZoneId);
  const shippingPrice =
    hasPhysicalLines && selectedZone ? selectedZone.price : 0;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  /** Livraison facturée dès qu’il y a des lignes physiques et une zone (aligné CartView après ouverture checkout). */
  const total =
    subtotal + (hasPhysicalLines && selectedZone ? shippingPrice : 0);

  const steps = [
    { id: 1, label: "Panier", Icon: ShoppingBag },
    { id: 2, label: "Livraison", Icon: Truck },
    { id: 3, label: "Paiement", Icon: CreditCard },
    { id: 4, label: "Confirmation", Icon: CheckCircle2 },
  ] as const;

  const paymentChoiceBoth = escrowAvail && codAvail;

  const handleNext = () => {
    setError(null);

    if (currentStep === 2) {
      if (formData.fullName.trim().length < 2) {
        setError("Renseigne ton nom complet");
        return;
      }
      if (!/^\+?[0-9\s]{8,20}$/.test(formData.phone)) {
        setError("Téléphone invalide");
        return;
      }
      if (hasPhysicalLines && zones.length > 0 && !formData.shippingZoneId) {
        setError("Choisis une zone de livraison");
        return;
      }
    }

    if (currentStep === 3 && !escrowAvail && !codAvail) {
      setError("Aucun moyen de paiement disponible pour cette boutique");
      return;
    }

    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const submitOrder = () => {
    setError(null);
    if (formData.fullName.trim().length < 2) {
      setError("Renseigne ton nom complet");
      setCurrentStep(2);
      return;
    }
    if (!/^\+?[0-9\s]{8,20}$/.test(formData.phone)) {
      setError("Téléphone invalide");
      setCurrentStep(2);
      return;
    }
    if (hasPhysicalLines && zones.length > 0 && !formData.shippingZoneId) {
      setError("Choisis une zone de livraison");
      setCurrentStep(2);
      return;
    }
    if (items.length === 0) {
      setError("Ton panier est vide");
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        shopSlug: shop.slug,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email || undefined,
        customerCity: formData.city || undefined,
        customerAddress: formData.address || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingZoneId:
          hasPhysicalLines && zones.length > 0
            ? formData.shippingZoneId
            : undefined,
        paymentMethod: formData.paymentMethod,
      });

      if (!result.ok) {
        setError(result.error ?? "Erreur");
        return;
      }
      clearCart(shop.slug);
      refresh();
      setLastOrderNumber(result.order.orderNumber);
      setCurrentStep(4);
    });
  };

  const checkoutRootStyle = useMemo(
    () =>
      ({
        "--checkout-primary": primaryColor,
      }) as CSSProperties,
    [primaryColor]
  );

  if (!mounted) {
    return (
      <div className={styles.checkout} style={checkoutRootStyle}>
        <div className={styles.checkoutContainer} />
      </div>
    );
  }

  if (items.length === 0 && currentStep < 4) {
    return null;
  }

  return (
    <div className={styles.checkout} style={checkoutRootStyle}>
      <div className={styles.checkoutContainer}>
        {currentStep < 4 ? (
          <Link href={`/shop/${shop.slug}/panier`} className={styles.backLink}>
            <ArrowLeft size={16} strokeWidth={2.2} />
            Retour au panier
          </Link>
        ) : (
          <Link href={`/shop/${shop.slug}`} className={styles.backLink}>
            <ArrowLeft size={16} strokeWidth={2.2} />
            Retour à la boutique
          </Link>
        )}

        <div className={styles.checkoutLayout}>
          <div className={styles.checkoutMain}>
            <h1 className={styles.checkoutTitle}>Finaliser ma commande</h1>

            <div className={styles.stepper}>
              {steps.map((step, idx) => {
                const StepIcon =
                  step.id < currentStep ? CheckCircle2 : step.Icon;
                const dotActive = step.id <= currentStep;
                const lineActive = step.id < currentStep;
                return (
                  <Fragment key={step.id}>
                    <div className={styles.stepperNode}>
                      <div
                        className={`${styles.stepperDot} ${dotActive ? styles.stepperDotActive : ""}`}
                        style={
                          dotActive
                            ? {
                                backgroundColor: primaryColor,
                                borderColor: primaryColor,
                              }
                            : undefined
                        }
                      >
                        <StepIcon size={14} strokeWidth={2.2} />
                      </div>
                      <span
                        className={`${styles.stepperLabel} ${step.id === currentStep ? styles.stepperLabelActive : ""}`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`${styles.stepperLine} ${lineActive ? styles.stepperLineActive : ""}`}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>

            {error && <div className={styles.alertError}>{error}</div>}

            <div className={styles.stepContent}>
              {currentStep === 1 && (
                <div className={styles.formBlock}>
                  <p className={styles.stepCartHint}>
                    Vérifie les articles ci-contre puis passe aux informations de
                    livraison.
                  </p>
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.formBlock}>
                  <h2 className={styles.formTitle}>
                    Informations de livraison
                  </h2>
                  <div className={styles.formGrid}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Nom complet *</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Téléphone *</label>
                      <input
                        type="tel"
                        className={styles.formInput}
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+237 6XX XX XX XX"
                      />
                    </div>
                    <div className={styles.formFieldFull}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        type="email"
                        className={styles.formInput}
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="jean@example.com"
                      />
                    </div>
                    {hasPhysicalLines && zones.length > 0 && (
                      <div className={styles.formFieldFull}>
                        <label className={styles.formLabel}>
                          Zone de livraison *
                        </label>
                        <select
                          className={styles.formSelect}
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
                              {z.name}
                              {" — "}
                              {z.price.toLocaleString("fr-FR")} {cur}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className={styles.formFieldFull}>
                      <label className={styles.formLabel}>
                        Adresse complète *
                      </label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="123 rue de la Paix, Quartier Bonanjo"
                      />
                    </div>
                    <div className={styles.formFieldFull}>
                      <label className={styles.formLabel}>Ville *</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="Douala"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className={styles.formBlock}>
                  <h2 className={styles.formTitle}>
                    {paymentChoiceBoth
                      ? "Choisir le mode de paiement"
                      : "Mode de paiement"}
                  </h2>
                  {paymentChoiceBoth ? (
                    <div className={styles.paymentOptions}>
                      <button
                        type="button"
                        className={`${styles.paymentOption} ${formData.paymentMethod === "online_escrow" ? styles.paymentOptionActive : ""}`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paymentMethod: "online_escrow",
                          })
                        }
                        style={
                          formData.paymentMethod === "online_escrow"
                            ? { borderColor: primaryColor }
                            : undefined
                        }
                      >
                        <div
                          className={styles.paymentOptionIcon}
                          style={{ color: primaryColor }}
                        >
                          <ShieldCheck size={22} strokeWidth={2} />
                        </div>
                        <div className={styles.paymentOptionText}>
                          <span className={styles.paymentOptionTitle}>
                            Paiement sécurisé en ligne
                          </span>
                          <span className={styles.paymentOptionDesc}>
                            Mobile Money ou carte bancaire — protégé par Sellia
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`${styles.paymentOption} ${formData.paymentMethod === "cash_on_delivery" ? styles.paymentOptionActive : ""}`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paymentMethod: "cash_on_delivery",
                          })
                        }
                        style={
                          formData.paymentMethod === "cash_on_delivery"
                            ? { borderColor: primaryColor }
                            : undefined
                        }
                      >
                        <div
                          className={styles.paymentOptionIcon}
                          style={{ color: primaryColor }}
                        >
                          <CreditCard size={22} strokeWidth={2} />
                        </div>
                        <div className={styles.paymentOptionText}>
                          <span className={styles.paymentOptionTitle}>
                            Paiement à la livraison
                          </span>
                          <span className={styles.paymentOptionDesc}>
                            Vous payez quand vous recevez le produit
                          </span>
                        </div>
                      </button>
                    </div>
                  ) : escrowAvail ? (
                    <p className={styles.stepCartHint}>
                      Paiement sécurisé en ligne (Mobile Money ou carte) — protégé
                      par Sellia.
                    </p>
                  ) : codAvail ? (
                    <p className={styles.stepCartHint}>
                      Tu paieras à la réception de ta commande.
                    </p>
                  ) : (
                    <p className={styles.stepCartHint}>
                      Aucun moyen de paiement n’est activé pour cette boutique.
                      Contacte le marchand.
                    </p>
                  )}
                </div>
              )}

              {currentStep === 4 && lastOrderNumber && (
                <div className={`${styles.formBlock} ${styles.successBlock}`}>
                  <CheckCircle2
                    size={40}
                    strokeWidth={2}
                    style={{ color: "#16A34A", marginBottom: 12 }}
                  />
                  <h2 className={styles.formTitle}>Commande enregistrée</h2>
                  <p>
                    Merci ! Ta commande{" "}
                    <strong>{lastOrderNumber}</strong> a bien été créée.
                  </p>
                  <Link
                    href={`/shop/${shop.slug}/commande/${lastOrderNumber}`}
                    className={styles.successLink}
                    style={{ color: primaryColor }}
                  >
                    Voir les détails de la commande
                  </Link>
                </div>
              )}
            </div>

            {currentStep === 3 &&
              escrowAvail &&
              formData.paymentMethod === "online_escrow" && (
                <div className={styles.trustBlock}>
                  <div className={styles.trustBlockHeader}>
                    <div
                      className={styles.trustBlockIcon}
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ShieldCheck size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={styles.trustBlockTitle}>Payer sans crainte</h3>
                      <p className={styles.trustBlockSubtitle}>
                        Votre argent est protégé par Sellia. Vous ne payez le marchand
                        qu&apos;à la livraison.
                      </p>
                    </div>
                  </div>

                  <div className={styles.trustBlockSteps}>
                    <div className={styles.trustStep}>
                      <span
                        className={styles.trustStepNum}
                        style={{ backgroundColor: primaryColor }}
                      >
                        1
                      </span>
                      <div className={styles.trustStepContent}>
                        <span className={styles.trustStepTitle}>Vous payez maintenant</span>
                        <span className={styles.trustStepDesc}>
                          Mobile Money ou carte bancaire. Vos fonds sont immédiatement
                          bloqués en sécurité chez Sellia.
                        </span>
                      </div>
                    </div>

                    <div className={styles.trustStep}>
                      <span
                        className={styles.trustStepNum}
                        style={{ backgroundColor: primaryColor }}
                      >
                        2
                      </span>
                      <div className={styles.trustStepContent}>
                        <span className={styles.trustStepTitle}>
                          Vous recevez votre QR code
                        </span>
                        <span className={styles.trustStepDesc}>
                          Par email et SMS — c&apos;est votre preuve d&apos;achat unique.
                          Conservez-le précieusement.
                        </span>
                      </div>
                    </div>

                    <div className={styles.trustStep}>
                      <span
                        className={styles.trustStepNum}
                        style={{ backgroundColor: primaryColor }}
                      >
                        3
                      </span>
                      <div className={styles.trustStepContent}>
                        <span className={styles.trustStepTitle}>
                          À la livraison, le marchand scanne
                        </span>
                        <span className={styles.trustStepDesc}>
                          Le marchand vérifie votre QR code. Une fois scanné, il reçoit son
                          paiement.
                          <strong>
                            {" "}
                            Vous recevez votre produit, il reçoit son argent.
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className={styles.trustStep}>
                      <span
                        className={styles.trustStepNum}
                        style={{ backgroundColor: "#16A34A" }}
                      >
                        <Check size={12} strokeWidth={3.5} />
                      </span>
                      <div className={styles.trustStepContent}>
                        <span
                          className={styles.trustStepTitle}
                          style={{ color: "#16A34A" }}
                        >
                          Remboursement automatique
                        </span>
                        <span className={styles.trustStepDesc}>
                          Si non livré sous 6 jours, vous êtes{" "}
                          <strong>automatiquement remboursé</strong>. Aucune démarche à
                          faire.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.trustBlockFooter}>
                    <Lock size={13} strokeWidth={2.4} />
                    <span>
                      Paiement 100% sécurisé · Protection acheteur Sellia · Garantie totale
                    </span>
                  </div>
                </div>
              )}

            {currentStep < 4 && (
              <div className={styles.stepActions}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className={styles.stepBackBtn}
                    onClick={handleBack}
                    disabled={isPending}
                  >
                    Retour
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    className={styles.stepNextBtn}
                    onClick={handleNext}
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    }}
                  >
                    Continuer
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.stepNextBtn}
                    onClick={submitOrder}
                    disabled={isPending}
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    }}
                  >
                    {isPending ? "Patienter…" : "Finaliser ma commande"}
                  </button>
                )}
              </div>
            )}
          </div>

          {currentStep < 4 ? (
            <aside className={styles.summary}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Récapitulatif</h3>

                <div className={styles.summaryItems}>
                  {items.map((item) => (
                    <div key={item.productId} className={styles.summaryItem}>
                      <div className={styles.summaryItemImage}>
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} />
                        )}
                        <span className={styles.summaryItemQty}>
                          {item.quantity}
                        </span>
                      </div>
                      <div className={styles.summaryItemInfo}>
                        <span className={styles.summaryItemName}>
                          {item.name}
                        </span>
                        <span className={styles.summaryItemPrice}>
                          {(item.price * item.quantity).toLocaleString("fr-FR")}{" "}
                          {cur}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryRow}>
                  <span>Sous-total</span>
                  <span>{subtotal.toLocaleString("fr-FR")} {cur}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Livraison</span>
                  <span>
                    {hasPhysicalLines && selectedZone
                      ? `${shippingPrice.toLocaleString("fr-FR")} ${cur}`
                      : "—"}
                  </span>
                </div>

                <div className={styles.summaryDivider} />

                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span
                    className={styles.summaryTotalAmount}
                    style={{ color: primaryColor }}
                  >
                    {total.toLocaleString("fr-FR")} {cur}
                  </span>
                </div>

                <div className={styles.summaryTrust}>
                  <div className={styles.summaryTrustItem}>
                    <Lock size={13} strokeWidth={2.2} />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  <div className={styles.summaryTrustItem}>
                    <ShieldCheck size={13} strokeWidth={2.2} />
                    <span>Protection acheteur</span>
                  </div>
                  <div className={styles.summaryTrustItem}>
                    <Truck size={13} strokeWidth={2.2} />
                    <span>Livraison rapide</span>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
