"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useState,
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
  ArrowRight,
  Check,
  RefreshCw,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
  Star,
  Loader2,
  Image as ImageIcon,
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
import PaymentLogos from "@/components/shop/PaymentLogos";
import type { PaymentMethod as PaymentLogoType } from "@/components/shop/PaymentLogos";
import styles from "./checkout.module.css";

function currencyLabel(c: string | null | undefined): string {
  return !c || c === "XAF" ? "FCFA" : c;
}

function getProviderName(provider: PaymentLogoType): string {
  const names: Partial<Record<PaymentLogoType, string>> = {
    wave: "Wave",
    mtn_momo: "MTN MoMo",
    orange_money: "Orange Money",
    moov_money: "Moov Money",
    free_money: "Free Money",
    airtel_money: "Airtel Money",
    tmoney: "T-Money",
    vodafone_cash: "Vodafone Cash",
    celtiis_cash: "MyCeltiis",
    tigo_cash: "Tigo Cash",
    visa: "Visa",
    mastercard: "Mastercard",
  };
  return names[provider] ?? provider;
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
  const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);

  const [paymentSubMethod, setPaymentSubMethod] = useState<"mobile_money" | "card">("mobile_money");
  const [selectedProvider, setSelectedProvider] = useState<PaymentLogoType | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
  const total =
    subtotal + (hasPhysicalLines && selectedZone ? shippingPrice : 0);

  const steps = [
    { id: 1, label: "Panier", Icon: ShoppingBag },
    { id: 2, label: "Livraison", Icon: Truck },
    { id: 3, label: "Paiement", Icon: CreditCard },
    { id: 4, label: "Confirmation", Icon: CheckCircle2 },
  ] as const;

  const paymentChoiceBoth = escrowAvail && codAvail;

  const handleItemQtyChange = (productId: string, qty: number) => {
    const next = updateCartQuantity(shop.slug, productId, qty);
    setItems(next);
    refresh();
  };

  const handleItemRemove = (productId: string) => {
    const next = removeCartItem(shop.slug, productId);
    setItems(next);
    refresh();
  };

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

  const canProceedToPayment =
    formData.paymentMethod === "cash_on_delivery" ||
    (formData.paymentMethod === "online_escrow" && selectedProvider !== null);

  const handleProceedToPayment = async () => {
    if (isProcessingPayment) return;
    if (!canProceedToPayment) return;

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

    setIsProcessingPayment(true);

    try {
      const response = await fetch(`/api/shop/${shop.slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.fullName,
          customerPhone: formData.phone,
          customerEmail: formData.email || null,
          deliveryAddress: formData.address,
          deliveryCity: formData.city,
          deliveryNotes: null,
          paymentMethod: formData.paymentMethod,
          paymentSubMethod: formData.paymentMethod === "online_escrow" ? paymentSubMethod : null,
          paymentProvider: selectedProvider,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
          })),
          subtotal,
          shippingFee: shippingPrice,
          total,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Erreur lors du paiement. Réessayez.");
        setIsProcessingPayment(false);
        return;
      }

      clearCart(shop.slug);
      refresh();
      router.push(`/shop/${shop.slug}/commande/${result.orderNumber}`);
    } catch (err) {
      console.error("[checkout] Error:", err);
      setError("Erreur réseau. Vérifiez votre connexion.");
      setIsProcessingPayment(false);
    }
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
                        <span className={styles.recommendedBadge}>
                          <Star size={10} strokeWidth={2.5} fill="currentColor" />
                          RECOMMANDÉ
                        </span>
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
                      Aucun moyen de paiement n&apos;est activé pour cette boutique.
                      Contacte le marchand.
                    </p>
                  )}

                  {formData.paymentMethod === "online_escrow" && (
                    <div className={styles.subMethodSelector}>
                      <div className={styles.subMethodTabs}>
                        <button
                          type="button"
                          className={`${styles.subMethodTab} ${paymentSubMethod === "mobile_money" ? styles.subMethodTabActive : ""}`}
                          onClick={() => {
                            setPaymentSubMethod("mobile_money");
                            setSelectedProvider(null);
                          }}
                          style={paymentSubMethod === "mobile_money" ? { borderColor: primaryColor, color: primaryColor } : undefined}
                        >
                          Mobile Money
                        </button>
                        <button
                          type="button"
                          className={`${styles.subMethodTab} ${paymentSubMethod === "card" ? styles.subMethodTabActive : ""}`}
                          onClick={() => {
                            setPaymentSubMethod("card");
                            setSelectedProvider(null);
                          }}
                          style={paymentSubMethod === "card" ? { borderColor: primaryColor, color: primaryColor } : undefined}
                        >
                          Carte bancaire
                        </button>
                      </div>

                      {paymentSubMethod === "mobile_money" && (
                        <div className={styles.providerGrid}>
                          {(["wave", "mtn_momo", "orange_money", "moov_money", "free_money", "airtel_money"] as PaymentLogoType[]).map((provider) => (
                            <button
                              key={provider}
                              type="button"
                              className={`${styles.providerCard} ${selectedProvider === provider ? styles.providerCardActive : ""}`}
                              onClick={() => setSelectedProvider(provider)}
                              style={selectedProvider === provider ? { borderColor: primaryColor } : undefined}
                            >
                              <PaymentLogos methods={[provider]} size="md" variant="circle" />
                              <span className={styles.providerName}>{getProviderName(provider)}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {paymentSubMethod === "card" && (
                        <div className={styles.providerGrid}>
                          {(["visa", "mastercard"] as PaymentLogoType[]).map((provider) => (
                            <button
                              key={provider}
                              type="button"
                              className={`${styles.providerCard} ${selectedProvider === provider ? styles.providerCardActive : ""}`}
                              onClick={() => setSelectedProvider(provider)}
                              style={selectedProvider === provider ? { borderColor: primaryColor } : undefined}
                            >
                              <PaymentLogos methods={[provider]} size="md" variant="rounded" />
                              <span className={styles.providerName}>
                                {provider === "visa" ? "Visa" : "Mastercard"}
                              </span>
                            </button>
                          ))}

                          <div className={`${styles.providerCard} ${styles.providerCardDisabled}`}>
                            <CreditCard size={28} strokeWidth={1.8} />
                            <span className={styles.providerName}>Autres cartes</span>
                            <span className={styles.providerSoon}>Bientôt</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {formData.paymentMethod === "online_escrow" && (
                    <div className={styles.qrExplanation}>
                      <div className={styles.qrHeader}>
                        <div className={styles.qrIcon} style={{ backgroundColor: primaryColor }}>
                          <ShieldCheck size={18} strokeWidth={2.2} />
                        </div>
                        <div className={styles.qrHeaderText}>
                          <h4 className={styles.qrTitle}>Payez sans crainte avec Sellia</h4>
                          <p className={styles.qrSubtitle}>
                            Vos fonds sont protégés. Vous ne validez le paiement qu&apos;à la livraison.
                          </p>
                        </div>
                      </div>

                      <div className={styles.qrSteps}>
                        <div className={styles.qrStep}>
                          <span className={styles.qrStepNum} style={{ backgroundColor: primaryColor }}>1</span>
                          <div className={styles.qrStepContent}>
                            <span className={styles.qrStepTitle}>Vous payez en toute sécurité</span>
                            <span className={styles.qrStepDesc}>
                              Mobile Money ou carte bancaire. Vos fonds sont immédiatement <strong>bloqués chez Sellia</strong>, pas envoyés au vendeur.
                            </span>
                          </div>
                        </div>

                        <div className={styles.qrStep}>
                          <span className={styles.qrStepNum} style={{ backgroundColor: primaryColor }}>2</span>
                          <div className={styles.qrStepContent}>
                            <span className={styles.qrStepTitle}>Vous recevez votre QR code</span>
                            <span className={styles.qrStepDesc}>
                              Par <strong>email et SMS</strong> — c&apos;est votre preuve de commande unique. Conservez-le précieusement jusqu&apos;à la livraison.
                            </span>
                          </div>
                        </div>

                        <div className={styles.qrStep}>
                          <span className={styles.qrStepNum} style={{ backgroundColor: primaryColor }}>3</span>
                          <div className={styles.qrStepContent}>
                            <span className={styles.qrStepTitle}>À la livraison, vous présentez votre QR</span>
                            <span className={styles.qrStepDesc}>
                              Le vendeur le scanne <strong>uniquement si vous êtes satisfait</strong>. Sans votre QR, il ne reçoit pas son paiement.
                            </span>
                          </div>
                        </div>

                        <div className={styles.qrStepGreen}>
                          <span className={styles.qrStepNumGreen}>
                            <Check size={13} strokeWidth={3.5} />
                          </span>
                          <div className={styles.qrStepContent}>
                            <span className={styles.qrStepTitleGreen}>Remboursement automatique garanti</span>
                            <span className={styles.qrStepDesc}>
                              Si vous n&apos;êtes pas livré sous <strong>6 jours</strong>, vous êtes <strong>automatiquement remboursé</strong>. Aucune démarche à faire.
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.qrFooter}>
                        <Lock size={12} strokeWidth={2.4} />
                        <span>Protection acheteur Sellia · Vos données sont chiffrées</span>
                      </div>
                    </div>
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

            {currentStep < 4 && (
              <div className={styles.stepActions}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className={styles.stepBackBtn}
                    onClick={handleBack}
                    disabled={isProcessingPayment}
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
                    onClick={handleProceedToPayment}
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    }}
                    disabled={!canProceedToPayment || isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 size={16} strokeWidth={2.2} className={styles.spin} />
                        Traitement...
                      </>
                    ) : (
                      <>
                        Procéder au paiement
                        <ArrowRight size={16} strokeWidth={2.4} />
                      </>
                    )}
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
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <div className={styles.summaryItemPlaceholder}>
                            <ImageIcon size={20} strokeWidth={1.8} />
                          </div>
                        )}
                      </div>

                      <div className={styles.summaryItemInfo}>
                        <span className={styles.summaryItemName}>
                          {item.name}
                        </span>
                        <span className={styles.summaryItemPrice}>
                          {item.price.toLocaleString("fr-FR")} {cur}
                        </span>

                        <div className={styles.summaryItemActions}>
                          <div className={styles.summaryQtyControl}>
                            <button
                              type="button"
                              className={styles.summaryQtyBtn}
                              onClick={() => handleItemQtyChange(item.productId, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              aria-label="Diminuer"
                            >
                              <Minus size={11} strokeWidth={2.5} />
                            </button>
                            <span className={styles.summaryQtyValue}>{item.quantity}</span>
                            <button
                              type="button"
                              className={styles.summaryQtyBtn}
                              onClick={() => handleItemQtyChange(item.productId, item.quantity + 1)}
                              aria-label="Augmenter"
                            >
                              <Plus size={11} strokeWidth={2.5} />
                            </button>
                          </div>

                          <button
                            type="button"
                            className={styles.summaryRemoveBtn}
                            onClick={() => handleItemRemove(item.productId)}
                            aria-label="Retirer du panier"
                          >
                            <Trash2 size={13} strokeWidth={2.2} />
                          </button>
                        </div>
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

                <div className={styles.summaryTrustBadges}>
                  <div className={styles.summaryBadge}>
                    <div className={styles.summaryBadgeIcon} style={{ color: "#16A34A" }}>
                      <ShieldCheck size={14} strokeWidth={2.4} />
                    </div>
                    <span className={styles.summaryBadgeText}>Fonds protégés</span>
                  </div>
                  <div className={styles.summaryBadge}>
                    <div className={styles.summaryBadgeIcon} style={{ color: "#16A34A" }}>
                      <RefreshCw size={14} strokeWidth={2.4} />
                    </div>
                    <span className={styles.summaryBadgeText}>Remboursement garanti</span>
                  </div>
                  <div className={styles.summaryBadge}>
                    <div className={styles.summaryBadgeIcon} style={{ color: "#16A34A" }}>
                      <Lock size={14} strokeWidth={2.4} />
                    </div>
                    <span className={styles.summaryBadgeText}>Données chiffrées</span>
                  </div>
                  <div className={styles.summaryBadge}>
                    <div className={styles.summaryBadgeIcon} style={{ color: "#16A34A" }}>
                      <MessageCircle size={14} strokeWidth={2.4} />
                    </div>
                    <span className={styles.summaryBadgeText}>Support 24/7</span>
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
