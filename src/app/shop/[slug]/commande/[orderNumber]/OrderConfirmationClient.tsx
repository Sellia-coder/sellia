"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Download,
  Mail,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { usePixelTracking } from "@/lib/use-pixel-tracking";
import styles from "./confirmation.module.css";
import PaymentPendingPolling from "@/components/shop/PaymentPendingPolling";
import TrustSection from "@/components/shop/TrustSection";

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
  currency: string;
  paidAt?: string | null;
  refundDeadline?: string | null;
  items: OrderConfirmationItem[];
  qrPngUrl: string;
  deliveryCode?: string | null;
  deliveredAt?: string | null;
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
    order.paymentStatus === "delivered";
  const isCashOnDelivery = order.paymentMethod === "cash_on_delivery";
  const showConfirmation = isPaid || isCashOnDelivery;
  const showDeliveryCode =
    !!order.deliveryCode &&
    order.paymentStatus === "paid_escrow" &&
    !order.deliveredAt;

  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const rootStyle = { "--shop-primary": primary } as CSSProperties;

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

  const title = isCashOnDelivery
    ? "Commande confirmée"
    : "Paiement confirmé";
  const subtitle = isCashOnDelivery
    ? "Le marchand vous contactera pour la livraison."
    : "Vos fonds sont protégés par Sellia jusqu'à la livraison";

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

        <div
          className={`${styles.mainGrid} ${isCashOnDelivery ? styles.mainGridCodOnly : ""}`}
        >
          {!isCashOnDelivery && (
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
            {!isCashOnDelivery && (
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
              {order.feesAdded != null && order.feesAdded > 0 && (
                <div className={styles.recapLine}>
                  <span>Frais opérateur</span>
                  <span>
                    +{formatPrice(order.feesAdded)} {order.currency}
                  </span>
                </div>
              )}
              <div className={styles.recapTotal}>
                <span>{isCashOnDelivery ? "Total" : "Total payé"}</span>
                <strong style={{ color: primary }}>
                  {formatPrice(order.total)} {order.currency}
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
