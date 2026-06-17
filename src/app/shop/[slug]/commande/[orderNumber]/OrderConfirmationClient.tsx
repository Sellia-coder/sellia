"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Download,
  DownloadCloud,
  Mail,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  MessageCircle,
  Wrench,
} from "lucide-react";
import { usePixelTracking } from "@/lib/use-pixel-tracking";
import styles from "./confirmation.module.css";
import PaymentPendingPolling from "@/components/shop/PaymentPendingPolling";
import TrustSection from "@/components/shop/TrustSection";
import ShopCustomerAuthModal from "@/components/shop/ShopCustomerAuthModal";

export interface OrderConfirmationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderConfirmationProps {
  shopSlug: string;
  shopName: string;
  shopPrimaryColor?: string | null;
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  customerEmail?: string | null;
  total: number;
  subTotal: number;
  shipping?: number;
  feesAdded?: number;
  operatorFee?: number;
  currency: string;
  paidAt?: string | null;
  refundDeadline?: string | null;
  items: OrderConfirmationItem[];
  qrPngUrl: string;
  deliveryCode?: string | null;
  deliveredAt?: string | null;
  digitalDownloads?: { name: string; url: string | null }[];
  isPurelyDigital?: boolean;
  hasPhysicalItems?: boolean;
  orderKind?: "physical" | "digital" | "service" | "mixed";
  serviceItems?: { name: string; description: string | null }[];
  shopContact?: {
    email?: string | null;
    whatsapp?: string | null;
    phone?: string | null;
  };
}

interface PaymentPollingProps {
  operatorCode: string;
  countryCode: string;
  total: number;
  currency: string;
}

interface Props {
  order: OrderConfirmationProps;
  paymentPolling?: PaymentPollingProps | null;
}

export default function OrderConfirmationClient({
  order,
  paymentPolling = null,
}: Props) {
  const router = useRouter();
  const { trackPurchase } = usePixelTracking();
  const primary = order.shopPrimaryColor || "#E84B1F";
  const isPaid =
    order.paymentStatus === "paid_escrow" ||
    order.paymentStatus === "paid_released" ||
    order.paymentStatus === "delivered";
  const isCashOnDelivery = order.paymentMethod === "cash_on_delivery";
  const showConfirmation = isPaid || isCashOnDelivery;
  const showDeliveryCode =
    !!order.deliveryCode &&
    order.paymentStatus === "paid_escrow" &&
    !order.deliveredAt;
  const digitalDownloads = order.digitalDownloads ?? [];
  const hasDigitalDownloads = digitalDownloads.length > 0;
  const hasPhysicalItems = order.hasPhysicalItems ?? !order.isPurelyDigital;
  const showQrCard =
    !isCashOnDelivery && hasPhysicalItems;

  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);

  const rootStyle = { "--shop-primary": primary } as CSSProperties;
  const orderKind = order.orderKind ?? "physical";
  const isDigitalOrService =
    !hasPhysicalItems && orderKind !== "physical";
  const isFailed =
    order.paymentStatus === "failed" ||
    order.paymentStatus === "cancelled";
  const serviceItems = order.serviceItems ?? [];
  const shopContact = order.shopContact ?? {};
  const primaryProductName =
    order.items[0]?.productName ?? "Votre achat";

  useEffect(() => {
    if (!showConfirmation) return;
    const key = `purchase_tracked_${order.orderNumber}`;
    if (sessionStorage.getItem(key)) return;

    trackPurchase({
      orderId: order.orderNumber,
      total: order.total,
      currency: order.currency === "FCFA" ? "XAF" : order.currency,
      items: order.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
    });
    sessionStorage.setItem(key, "1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.orderNumber, showConfirmation]);

  if (paymentPolling) {
    return (
      <div className={styles.pendingWrap}>
        <PaymentPendingPolling
          shopSlug={order.shopSlug}
          orderNumber={order.orderNumber}
          operatorCode={paymentPolling.operatorCode}
          countryCode={paymentPolling.countryCode}
          total={paymentPolling.total}
          currency={paymentPolling.currency}
          primaryColor={primary}
          autoRedirect={false}
          onSuccess={() => router.refresh()}
          onFailed={() => router.refresh()}
          onCancel={() => router.push(`/shop/${order.shopSlug}`)}
        />
      </div>
    );
  }

  if (!showConfirmation) {
    if (isFailed) {
      return (
        <div className={styles.wrap} style={rootStyle}>
          <div className={styles.failedCard}>
            <div className={styles.failedIcon} aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1 className={styles.failedTitle}>Paiement non abouti</h1>
            <p className={styles.failedDesc}>
              La transaction n&apos;a pas pu être confirmée. Aucun débit définitif n&apos;a été
              enregistré. Vous pouvez réessayer depuis la boutique.
            </p>
            <Link href={`/shop/${order.shopSlug}`} className={styles.backLink}>
              <ArrowLeft size={14} />
              Retour à {order.shopName}
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.wrap} style={rootStyle}>
        <div className={styles.container}>
          <div className={styles.successBanner}>
            <div className={styles.successText}>
              <h1 className={styles.successTitle}>Commande enregistrée</h1>
              <p className={styles.successSubtitle}>
                Votre commande est en cours de traitement.
              </p>
            </div>
            <div className={styles.orderNumberPill}>
              <span className={styles.orderLabel}>N°</span>
              <code>{order.orderNumber}</code>
            </div>
          </div>
          <Link href={`/shop/${order.shopSlug}`} className={styles.backLink}>
            <ArrowLeft size={14} />
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownloadQR = async (format: "png" | "svg") => {
    setDownloading(true);
    try {
      const url = `/api/shop/${order.shopSlug}/orders/${encodeURIComponent(order.orderNumber)}/qr?format=${format}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `sellia-${order.orderNumber}-qr.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  const handleSendEmail = async () => {
    if (!order.customerEmail) return;
    setEmailSending(true);
    setEmailError(null);
    try {
      const res = await fetch(
        `/api/shop/${order.shopSlug}/orders/${encodeURIComponent(order.orderNumber)}/send-qr`,
        { method: "POST" }
      );
      const data = await res.json();
      if (res.ok && data.ok && data.sent) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 4000);
      } else {
        setEmailError(
          data.message ?? "Impossible d'envoyer l'email. Vérifiez l'adresse client."
        );
      }
    } catch {
      setEmailError("Problème réseau");
    } finally {
      setEmailSending(false);
    }
  };

  const formatPrice = (n: number) => n.toLocaleString("fr-FR");
  const refundDate = order.refundDeadline
    ? new Date(order.refundDeadline).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
      })
    : null;

  const handleDownloadReceipt = () => {
    const paidLabel = order.paidAt
      ? new Date(order.paidAt).toLocaleString("fr-FR")
      : new Date().toLocaleString("fr-FR");
    const lines = [
      "REÇU SELLIA",
      "─────────────",
      `Boutique : ${order.shopName}`,
      `Commande : ${order.orderNumber}`,
      `Date : ${paidLabel}`,
      "",
      "Articles :",
      ...order.items.map(
        (i) =>
          `  · ${i.productName} × ${i.quantity} — ${formatPrice(i.unitPrice * i.quantity)} ${order.currency}`
      ),
      "",
      `Sous-total : ${formatPrice(order.subTotal)} ${order.currency}`,
      ...(order.shipping != null && order.shipping > 0
        ? [`Livraison : ${formatPrice(order.shipping)} ${order.currency}`]
        : []),
      ...(order.operatorFee != null && order.operatorFee > 0
        ? [`Frais opérateur : +${formatPrice(order.operatorFee)} ${order.currency}`]
        : []),
      `TOTAL : ${formatPrice(order.total + (order.operatorFee ?? 0))} ${order.currency}`,
      "",
      "Paiement sécurisé via Sellia — getsellia.com",
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sellia-recu-${order.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const merchantEmail =
    shopContact.email?.trim() || null;
  const merchantWhatsapp = shopContact.whatsapp?.trim() || null;
  const merchantPhone = shopContact.phone?.trim() || null;

  if (isDigitalOrService && !isCashOnDelivery) {
    const hasDownloadableFiles = digitalDownloads.some((d) => d.url);
    const showDigitalBlock =
      orderKind === "digital" ||
      orderKind === "mixed" ||
      digitalDownloads.length > 0;
    const showServiceBlock =
      orderKind === "service" ||
      orderKind === "mixed" ||
      serviceItems.length > 0;

    return (
      <div className={styles.digitalWrap} style={rootStyle}>
        <div className={styles.digitalContainer}>
          <div className={styles.digitalHero}>
            <div className={styles.digitalCheckWrap}>
              <svg
                className={styles.digitalCheckSvg}
                viewBox="0 0 24 24"
                width="36"
                height="36"
                fill="none"
                aria-hidden
              >
                <circle cx="12" cy="12" r="11" stroke="#16A34A" strokeWidth="2" />
                <path
                  d="M7 12 L11 16 L17 9"
                  stroke="#16A34A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className={styles.digitalHeroTitle}>Merci pour votre achat</h1>
            <p className={styles.digitalHeroSubtitle}>
              {orderKind === "service"
                ? "Prestation confirmée — le marchand vous recontacte."
                : hasDownloadableFiles
                  ? "Téléchargez vos fichiers ci-dessous."
                  : "Accès envoyé par email dès que le fichier est prêt."}
            </p>
            <span className={styles.digitalProductName}>{primaryProductName}</span>
          </div>

          {showDigitalBlock && (
            <div className={styles.accessCard}>
              <div className={styles.accessCardHeader}>
                <div className={styles.accessCardIcon}>
                  <DownloadCloud size={22} />
                </div>
                <h2 className={styles.accessCardTitle}>Vos fichiers</h2>
              </div>
              <p className={styles.accessCardDesc}>
                {hasDownloadableFiles
                  ? "Téléchargement immédiat. Retrouvez aussi vos achats dans votre espace client."
                  : "Lien en cours de préparation — consultez « Mes achats » ou votre email."}
              </p>
              {digitalDownloads.length > 0 ? (
                <div className={styles.downloadList}>
                  {digitalDownloads.map((d, i) =>
                    d.url ? (
                      <a
                        key={i}
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadRow}
                      >
                        <span className={styles.downloadName}>{d.name}</span>
                        <span className={styles.downloadAction}>
                          <Download size={16} />
                          Télécharger
                        </span>
                      </a>
                    ) : (
                      <div
                        key={i}
                        className={`${styles.downloadRow} ${styles.downloadRowPending}`}
                      >
                        <span className={styles.downloadName}>{d.name}</span>
                        <span className={styles.downloadPendingNote}>
                          En préparation
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className={styles.accessCardDesc} style={{ marginBottom: 0 }}>
                  Aucun fichier digital associé à cette commande pour le moment.
                </p>
              )}
              {order.customerEmail && hasDownloadableFiles && (
                <div className={styles.emailNote}>
                  <Mail size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Copie envoyée à <strong>{order.customerEmail}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {showServiceBlock && (
            <div className={styles.accessCard}>
              <div className={styles.accessCardHeader}>
                <div className={styles.accessCardIcon}>
                  <Wrench size={22} />
                </div>
                <h2 className={styles.accessCardTitle}>Prochaines étapes</h2>
              </div>
              <ol className={styles.serviceSteps}>
                <li className={styles.serviceStep}>
                  <span className={styles.serviceStepNum}>1</span>
                  <span className={styles.serviceStepText}>
                    <strong>Confirmation reçue</strong> — le marchand a été notifié de votre
                    commande.
                  </span>
                </li>
                <li className={styles.serviceStep}>
                  <span className={styles.serviceStepNum}>2</span>
                  <span className={styles.serviceStepText}>
                    <strong>Prise de contact</strong> — attendez les instructions d&apos;accès
                    (email, appel ou message).
                  </span>
                </li>
                <li className={styles.serviceStep}>
                  <span className={styles.serviceStepNum}>3</span>
                  <span className={styles.serviceStepText}>
                    <strong>Profitez du service</strong> — selon les modalités indiquées par{" "}
                    {order.shopName}.
                  </span>
                </li>
              </ol>
              {serviceItems.length > 0 && (
                <div className={styles.downloadList} style={{ marginTop: 16 }}>
                  {serviceItems.map((s, i) => (
                    <div key={i} className={styles.downloadRow}>
                      <div>
                        <div className={styles.downloadName}>{s.name}</div>
                        {s.description && (
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "#6b7280",
                              marginTop: 4,
                              lineHeight: 1.45,
                            }}
                          >
                            {s.description.replace(/<[^>]+>/g, "").slice(0, 200)}
                            {s.description.length > 200 ? "…" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(merchantEmail || merchantWhatsapp || merchantPhone) && (
                <div className={styles.merchantContact}>
                  {merchantWhatsapp && (
                    <a
                      href={`https://wa.me/${merchantWhatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactLink}
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </a>
                  )}
                  {merchantEmail && (
                    <a href={`mailto:${merchantEmail}`} className={styles.contactLink}>
                      <Mail size={14} />
                      Email
                    </a>
                  )}
                  {merchantPhone && !merchantWhatsapp && (
                    <a href={`tel:${merchantPhone}`} className={styles.contactLink}>
                      {merchantPhone}
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div className={styles.twoCol}>
            <div className={styles.receiptCard}>
              <div className={styles.receiptCardTitle}>Récapitulatif</div>
              <div className={styles.receiptMeta}>
                <div className={styles.receiptRow}>
                  <span className={styles.receiptLabel}>N° commande</span>
                  <span className={styles.receiptValue}>
                    {order.orderNumber}
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={styles.copyBtn}
                      title="Copier"
                      style={{ marginLeft: 6, verticalAlign: "middle" }}
                    >
                      {copied ? (
                        <Check size={12} color="#16A34A" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </span>
                </div>
                {order.paidAt && (
                  <div className={styles.receiptRow}>
                    <span className={styles.receiptLabel}>Date</span>
                    <span className={styles.receiptValue}>
                      {new Date(order.paidAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {order.items.map((item) => (
                  <div key={item.id} className={styles.receiptRow}>
                    <span className={styles.receiptLabel}>
                      {item.productName} × {item.quantity}
                    </span>
                    <span className={styles.receiptValue}>
                      {formatPrice(item.unitPrice * item.quantity)} {order.currency}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.receiptTotal}>
                <span className={styles.receiptTotalLabel}>Total payé</span>
                <span
                  className={styles.receiptTotalValue}
                  style={{ color: primary }}
                >
                  {formatPrice(order.total + (order.operatorFee ?? 0))}{" "}
                  {order.currency}
                </span>
              </div>
              <button
                type="button"
                className={styles.receiptBtn}
                onClick={handleDownloadReceipt}
              >
                <FileText size={15} />
                Télécharger le reçu
              </button>
            </div>

            <div className={styles.helpCard}>
              <h3 className={styles.helpTitle}>Une réclamation ?</h3>
              <p className={styles.helpDesc}>
                Connectez-vous à « Mes achats » avec l&apos;email de commande pour ouvrir un litige.
              </p>
              <button
                type="button"
                className={styles.helpBtn}
                onClick={() => setCustomerAuthOpen(true)}
              >
                <ShieldCheck size={16} />
                Mes achats &amp; litiges
              </button>
              <Link href={`/shop/${order.shopSlug}`} className={styles.backLink}>
                <ArrowLeft size={14} />
                Retour à {order.shopName}
              </Link>
            </div>
          </div>
        </div>

        {customerAuthOpen && (
          <ShopCustomerAuthModal
            shopSlug={order.shopSlug}
            shopName={order.shopName}
            primaryColor={primary}
            onClose={() => setCustomerAuthOpen(false)}
          />
        )}
      </div>
    );
  }

  const title = isCashOnDelivery
    ? "Commande confirmée"
    : "Paiement confirmé";
  const subtitle = isCashOnDelivery
    ? "Le marchand vous contactera pour la livraison."
    : hasPhysicalItems
      ? "Vos fonds sont protégés par Sellia jusqu'à la livraison"
      : "Votre achat est confirmé. Pour toute réclamation, connectez-vous à votre espace sur la boutique et ouvrez un litige.";

  return (
    <div className={styles.wrap} style={rootStyle}>
      <div className={styles.container}>
        <div className={styles.successBanner}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="11" stroke="#16A34A" strokeWidth="2" />
              <path
                d="M7 12 L11 16 L17 9"
                stroke="#16A34A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.successText}>
            <h1 className={styles.successTitle}>{title}</h1>
            <p className={styles.successSubtitle}>{subtitle}</p>
          </div>
          <div className={styles.orderNumberPill}>
            <span className={styles.orderLabel}>N°</span>
            <code>{order.orderNumber}</code>
            <button
              type="button"
              onClick={handleCopy}
              className={styles.copyBtn}
              title="Copier"
            >
              {copied ? (
                <Check size={13} color="#16A34A" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        </div>

        {hasDigitalDownloads && (
          <div
            style={{
              background:
                "linear-gradient(135deg, #FAFAF7, rgba(232,75,31,0.04))",
              border: "1px solid rgba(232,75,31,0.15)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <DownloadCloud size={24} color="#E84B1F" />
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: "20px",
                  color: "#0E1116",
                }}
              >
                Merci pour votre achat
              </h3>
            </div>
            <p
              style={{
                fontSize: "13.5px",
                color: "#4B5563",
                margin: "0 0 16px",
                lineHeight: 1.5,
              }}
            >
              Votre paiement est confirmé. Vos fichiers sont prêts à être
              téléchargés. Un lien vous a également été envoyé par email.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {digitalDownloads.map((d, i) =>
                d.url ? (
                  <a
                    key={i}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "white",
                      border: "1px solid var(--dash-border, #E5E5E0)",
                      borderRadius: "12px",
                      textDecoration: "none",
                      color: "#0E1116",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      {d.name}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#E84B1F",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      <Download size={16} /> Télécharger
                    </span>
                  </a>
                ) : (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "14px 16px",
                      background: "white",
                      border: "1px dashed var(--dash-border, #E5E5E0)",
                      borderRadius: "12px",
                      color: "#0E1116",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      {d.name}
                    </span>
                    <span
                      style={{
                        fontSize: "12.5px",
                        color: "#6B7280",
                        textAlign: "right",
                      }}
                    >
                      Votre fichier sera disponible très bientôt — contactez le
                      vendeur si besoin.
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        <div
          className={`${styles.mainGrid} ${!showQrCard ? styles.mainGridCodOnly : ""}`}
        >
          {showQrCard && (
            <div className={styles.qrCard}>
              <div className={styles.qrLabel}>
                <ShieldCheck size={14} />
                <span>Votre QR code de livraison</span>
              </div>
              <div className={styles.qrImageWrap}>
                <img
                  src={order.qrPngUrl}
                  alt="QR code de livraison"
                  className={styles.qrImage}
                />
              </div>
              <p className={styles.qrInstruction}>
                Présentez ce code au marchand{" "}
                <strong>uniquement</strong> lorsque vous êtes satisfait de votre
                commande.
              </p>

              {showDeliveryCode && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    background: "#FFFFFF",
                    border: `2px dashed ${primary}`,
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#8B8E94",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: "6px",
                    }}
                  >
                    Code de confirmation de livraison
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      letterSpacing: "6px",
                      color: primary,
                    }}
                  >
                    {order.deliveryCode}
                  </div>
                  <p
                    style={{
                      fontSize: "11.5px",
                      color: "#6B7280",
                      lineHeight: 1.5,
                      margin: "8px 0 0",
                    }}
                  >
                    Communiquez ce code au livreur{" "}
                    <strong>uniquement à la réception</strong> de votre colis.
                    Il libère le paiement au marchand.
                  </p>
                </div>
              )}
              <div className={styles.qrActions}>
                <button
                  type="button"
                  onClick={() => handleDownloadQR("png")}
                  disabled={downloading}
                  className={styles.qrActionBtn}
                >
                  <Download size={13} />
                  <span>PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadQR("svg")}
                  disabled={downloading}
                  className={styles.qrActionBtnSecondary}
                >
                  <Download size={13} />
                  <span>SVG</span>
                </button>
                {order.customerEmail && (
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={emailSending || emailSent}
                    className={styles.qrActionBtnSecondary}
                  >
                    {emailSent ? (
                      <Check size={13} color="#16A34A" />
                    ) : (
                      <Mail size={13} />
                    )}
                    <span>
                      {emailSent
                        ? "Envoyé !"
                        : emailSending
                          ? "..."
                          : "Email"}
                    </span>
                  </button>
                )}
              </div>
              {emailError && <div className={styles.qrError}>{emailError}</div>}
            </div>
          )}

          <div className={styles.summaryCol}>
            {!isCashOnDelivery && hasPhysicalItems && (
              <div className={styles.protectionCard}>
                <div className={styles.protectionIcon}>
                  <ShieldCheck size={16} color="#15803D" />
                </div>
                <div>
                  <div className={styles.protectionTitle}>
                    Protection acheteur active
                  </div>
                  {refundDate && (
                    <div className={styles.protectionSubtitle}>
                      Remboursement automatique si non livré avant le{" "}
                      <strong>{refundDate}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isCashOnDelivery && !hasPhysicalItems && (
              <div
                className={styles.protectionCard}
                style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
              >
                <div>
                  <div className={styles.protectionTitle} style={{ color: "#334155" }}>
                    Une réclamation ?
                  </div>
                  <div className={styles.protectionSubtitle}>
                    Connectez-vous à votre espace sur la boutique et ouvrez un litige
                    depuis « Mes achats ».
                  </div>
                </div>
              </div>
            )}

            <div className={styles.recapCard}>
              <div className={styles.recapHeader}>Récapitulatif</div>
              <div className={styles.recapItems}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.recapItem}>
                    <span className={styles.recapItemName}>
                      {item.productName}{" "}
                      <span className={styles.recapItemQty}>
                        × {item.quantity}
                      </span>
                    </span>
                    <span className={styles.recapItemPrice}>
                      {formatPrice(item.unitPrice * item.quantity)}{" "}
                      {order.currency}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.recapDivider} />
              <div className={styles.recapLine}>
                <span>Sous-total</span>
                <span>
                  {formatPrice(order.subTotal)} {order.currency}
                </span>
              </div>
              {order.shipping != null && order.shipping > 0 && (
                <div className={styles.recapLine}>
                  <span>Livraison</span>
                  <span>
                    {formatPrice(order.shipping)} {order.currency}
                  </span>
                </div>
              )}
              {order.operatorFee != null && order.operatorFee > 0 && (
                <div className={styles.recapLine}>
                  <span>Frais opérateur</span>
                  <span>
                    +{formatPrice(order.operatorFee)} {order.currency}
                  </span>
                </div>
              )}
              <div className={styles.recapTotal}>
                <span>{isCashOnDelivery ? "Total" : "Total payé"}</span>
                <strong style={{ color: primary }}>
                  {formatPrice(order.total + (order.operatorFee ?? 0))}{" "}
                  {order.currency}
                </strong>
              </div>
            </div>

            <Link href={`/shop/${order.shopSlug}`} className={styles.backLink}>
              <ArrowLeft size={14} />
              Retour à {order.shopName}
            </Link>
          </div>
        </div>

      </div>

      <div style={{ margin: "32px -16px -48px" }}>
        <TrustSection variant="compact" />
      </div>
    </div>
  );
}
