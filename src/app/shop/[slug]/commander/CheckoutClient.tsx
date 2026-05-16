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
  ChevronDown,
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
import PaymentPendingPolling from "@/components/shop/PaymentPendingPolling";
import CountryFlag from "@/components/shared/CountryFlag";
import { createOrderAction } from "@/app/actions/order";
import {
  getOperatorsForCountry,
  normalizePhoneNumber,
} from "@/lib/cartevo/operators-catalog";
import type { CartevoOperator, CartevoCountry } from "@/lib/cartevo/types";
import styles from "./checkout.module.css";

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
  const [momoCountry, setMomoCountry] = useState<string>("CM");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoOperator, setMomoOperator] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingCartevoTxId, setPendingCartevoTxId] = useState<string | null>(
    null
  );
  const [orderQrCode, setOrderQrCode] = useState<string | null>(null);
  const [paymentWasEscrow, setPaymentWasEscrow] = useState(false);

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
    const cart = getCart(shop.slug);
    if (cart.length === 0 && currentStep <= 3) {
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
    { id: 4, label: "Confirmation", Icon: RefreshCw },
    { id: 5, label: "Succès", Icon: CheckCircle2 },
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

    setCurrentStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const canProceedToPayment =
    formData.paymentMethod === "cash_on_delivery" ||
    (formData.paymentMethod === "online_escrow" &&
      paymentSubMethod === "mobile_money" &&
      !!momoOperator &&
      isValidMomoNumber(momoCountry, momoNumber));

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
      const isMoMo =
        formData.paymentMethod === "online_escrow" &&
        paymentSubMethod === "mobile_money" &&
        !!momoOperator;

      const payload: Parameters<typeof createOrderAction>[0] = {
        shopSlug: shop.slug,
        customerName: formData.fullName,
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
        const normalizedPhone = normalizePhoneNumber(momoNumber, momoCountry);
        payload.moMo = {
          country: momoCountry as CartevoCountry,
          operator: momoOperator as CartevoOperator,
          phoneNumber: normalizedPhone,
        };
      }

      const result = await createOrderAction(payload);

      if (!result.ok) {
        setError(result.error || "Erreur lors de la création de la commande");
        setIsProcessingPayment(false);
        return;
      }

      setLastOrderNumber(result.order.orderNumber);
      setOrderQrCode(result.order.qrCode ?? null);

      if (
        result.order.requiresConfirmation &&
        result.order.cartevoTransactionId
      ) {
        setPaymentWasEscrow(true);
        setPendingCartevoTxId(result.order.cartevoTransactionId);
        setCurrentStep(4);
      } else {
        setPaymentWasEscrow(false);
        clearCart(shop.slug);
        refresh();
        setCurrentStep(5);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
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

  if (items.length === 0 && currentStep <= 3) {
    return null;
  }

  return (
    <div className={styles.checkout} style={checkoutRootStyle}>
      <div className={styles.checkoutContainer}>
        {currentStep <= 3 ? (
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
                    <div className={styles.paymentTypeSelector}>
                      <div className={styles.paymentTypeGrid}>
                        <button
                          type="button"
                          className={`${styles.paymentTypeCard} ${paymentSubMethod === "mobile_money" ? styles.paymentTypeCardActive : ""}`}
                          onClick={() => setPaymentSubMethod("mobile_money")}
                          style={paymentSubMethod === "mobile_money" ? { borderColor: primaryColor, backgroundColor: `${primaryColor}08` } : undefined}
                        >
                          <span className={styles.paymentTypeLabel}>Mobile Money</span>
                          <div className={styles.paymentTypeLogos}>
                            <PaymentLogos methods={["mtn_momo", "wave", "orange_money"]} size="sm" variant="circle" />
                          </div>
                        </button>

                        <button
                          type="button"
                          className={`${styles.paymentTypeCard} ${styles.paymentTypeCardDisabled}`}
                          disabled
                          aria-label="Carte bancaire (bientôt disponible)"
                        >
                          <span className={styles.paymentTypeSoon}>Bientôt disponible</span>
                          <span className={styles.paymentTypeLabel}>Carte bancaire</span>
                          <div className={styles.paymentTypeLogos}>
                            <PaymentLogos methods={["visa", "mastercard"]} size="sm" variant="rounded" />
                          </div>
                        </button>
                      </div>

                      {paymentSubMethod === "mobile_money" && (
                        <>
                        <div className={styles.operatorSelector}>
                          <label className={styles.operatorSelectorLabel}>
                            Choisissez votre opérateur
                          </label>
                          <div className={styles.operatorGrid}>
                            {getOperatorsForCountry(momoCountry).map((op) => {
                              const isActive = momoOperator === op.code;
                              return (
                                <button
                                  type="button"
                                  key={op.code}
                                  className={`${styles.operatorCard} ${isActive ? styles.operatorCardActive : ""}`}
                                  onClick={() => setMomoOperator(op.code)}
                                  style={
                                    isActive
                                      ? {
                                          borderColor: op.color,
                                          backgroundColor: `${op.color}10`,
                                        }
                                      : undefined
                                  }
                                >
                                  <span
                                    className={styles.operatorLogo}
                                    style={{ color: op.color }}
                                  >
                                    {op.logoEmoji}
                                  </span>
                                  <span className={styles.operatorName}>
                                    {op.shortName}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {!momoOperator &&
                            getOperatorsForCountry(momoCountry).length > 0 && (
                              <span className={styles.operatorHint}>
                                Sélectionnez l&apos;opérateur de votre numéro de
                                paiement.
                              </span>
                            )}
                        </div>

                        <div className={styles.momoFieldWrap}>
                          <label className={styles.momoLabel}>Numéro Mobile Money</label>
                          <div className={styles.momoField}>
                            <div className={styles.momoCountrySelect}>
                              <select
                                value={momoCountry}
                                onChange={(e) => setMomoCountry(e.target.value)}
                                className={styles.momoCountrySelectInput}
                                aria-label="Pays"
                              >
                                <option value="CM">+237</option>
                                <option value="CI">+225</option>
                                <option value="SN">+221</option>
                                <option value="BJ">+229</option>
                                <option value="TG">+228</option>
                                <option value="BF">+226</option>
                                <option value="ML">+223</option>
                                <option value="NE">+227</option>
                                <option value="CG">+242</option>
                                <option value="GA">+241</option>
                                <option value="GN">+224</option>
                                <option value="RW">+250</option>
                              </select>
                              <div className={styles.momoCountryDisplay}>
                                <CountryFlag code={momoCountry as any} size="sm" />
                                <span>{getDialCode(momoCountry)}</span>
                                <ChevronDown size={12} strokeWidth={2.4} />
                              </div>
                            </div>

                            <input
                              type="tel"
                              inputMode="numeric"
                              className={styles.momoInput}
                              placeholder={getMomoPlaceholder(momoCountry)}
                              value={momoNumber}
                              onChange={(e) => setMomoNumber(e.target.value.replace(/[^0-9]/g, ""))}
                              maxLength={10}
                            />
                          </div>
                          <span className={styles.momoHint}>
                            Le numéro qui sera débité pour cette commande.
                          </span>
                        </div>
                        </>
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

              {currentStep === 4 &&
                pendingCartevoTxId &&
                lastOrderNumber &&
                momoOperator && (
                  <PaymentPendingPolling
                    shopSlug={shop.slug}
                    orderNumber={lastOrderNumber}
                    operatorCode={momoOperator}
                    countryCode={momoCountry}
                    total={total}
                    currency={cur}
                    primaryColor={primaryColor}
                    onSuccess={() => {
                      clearCart(shop.slug);
                      refresh();
                      setCurrentStep(5);
                    }}
                    onFailed={(reason) => {
                      setError(reason);
                      setCurrentStep(3);
                      setPendingCartevoTxId(null);
                    }}
                    onCancel={() => {
                      setError("Paiement annulé.");
                      setCurrentStep(3);
                      setPendingCartevoTxId(null);
                    }}
                  />
                )}

              {currentStep === 5 && lastOrderNumber && (
                <div className={`${styles.formBlock} ${styles.successBlock}`}>
                  <CheckCircle2
                    size={40}
                    strokeWidth={2}
                    style={{ color: "#16A34A", marginBottom: 12 }}
                  />
                  <h2 className={styles.formTitle}>
                    {paymentWasEscrow
                      ? "Paiement confirmé — fonds en escrow"
                      : "Commande enregistrée"}
                  </h2>
                  <p>
                    Merci ! Ta commande{" "}
                    <strong>{lastOrderNumber}</strong>{" "}
                    {paymentWasEscrow
                      ? "est payée. Tes fonds sont protégés par Sellia jusqu'à la livraison."
                      : "a bien été créée."}
                  </p>
                  {paymentWasEscrow && orderQrCode && (
                    <p className={styles.stepCartHint}>
                      Ton QR code de validation :{" "}
                      <strong>{orderQrCode}</strong> — présente-le au marchand à
                      la livraison.
                    </p>
                  )}
                  <Link
                    href={`/shop/${shop.slug}/commande/${lastOrderNumber}`}
                    className={styles.successLink}
                    style={{ color: primaryColor }}
                  >
                    Voir les détails et le QR code
                  </Link>
                </div>
              )}
            </div>

            {currentStep <= 3 && (
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

          {currentStep <= 3 ? (
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
