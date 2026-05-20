"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Mail,
  Loader2,
} from "lucide-react";
import styles from "./confirmation.module.css";

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  subtotal: number;
  total: number;
  feesAdded: number;
  shippingPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string | null;
  refundDeadline: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  shop: {
    slug: string;
    name: string;
    primaryColor: string | null;
    phone: string | null;
    whatsappNumber: string | null;
  };
  qrApiUrl: string;
  qrDownloadPngUrl: string;
  qrDownloadSvgUrl: string;
}

interface Props {
  order: OrderConfirmationData;
}

export default function OrderConfirmationClient({ order }: Props) {
  const primaryColor = order.shop.primaryColor ?? "#E84B1F";
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const isPaid =
    order.paymentStatus === "paid_escrow" || order.paymentStatus === "delivered";
  const isCashOnDelivery = order.paymentMethod === "cash_on_delivery";

  useEffect(() => {
    if (!isPaid || isCashOnDelivery) return;

    fetch(`${order.qrApiUrl}?format=dataurl`)
      .then((r) => r.json())
      .then((data) => {
        if (data.dataUrl) setQrDataUrl(data.dataUrl);
      })
      .catch(() => {
        import("qrcode").then((QRCode) =>
          QRCode.toDataURL(order.qrApiUrl.replace("?format=dataurl", ""), {
            width: 400,
            margin: 2,
            color: { dark: "#0A0E13", light: "#FFFFFF" },
          }).then(setQrDataUrl)
        );
      });
  }, [order, isPaid, isCashOnDelivery]);

  const handleDownloadQR = () => {
    window.open(order.qrDownloadPngUrl, "_blank");
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    setEmailError(null);
    try {
      const res = await fetch(
        `/api/shop/${order.shop.slug}/orders/${encodeURIComponent(order.orderNumber)}/send-qr`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.ok && data.sent) {
        setEmailSent(true);
      } else {
        setEmailError(
          data.message ?? "Impossible d'envoyer l'email. Vérifiez l'adresse client."
        );
      }
    } catch {
      setEmailError("Erreur réseau. Réessayez.");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className={styles.confirmation}>
      <div className={styles.container}>
        <div className={styles.successHeader}>
          <div
            className={styles.successIcon}
            style={{ backgroundColor: "#16A34A" }}
          >
            <CheckCircle2 size={36} strokeWidth={2.2} />
          </div>
          <h1 className={styles.successTitle}>
            {isCashOnDelivery
              ? "Commande confirmée"
              : isPaid
                ? "Paiement confirmé"
                : "Commande enregistrée"}
          </h1>
          <p className={styles.successSubtitle}>
            {isCashOnDelivery
              ? "Le marchand vous contactera pour la livraison."
              : isPaid
                ? "Vos fonds sont protégés par Sellia jusqu'à la livraison."
                : "Votre commande a bien été enregistrée."}
          </p>

          <div className={styles.orderNumber}>
            <span className={styles.orderNumberLabel}>N° de commande</span>
            <span className={styles.orderNumberValue}>{order.orderNumber}</span>
            <button
              type="button"
              className={styles.orderNumberCopy}
              onClick={handleCopyOrderNumber}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {isPaid && !isCashOnDelivery && (
          <div className={styles.protectionBanner}>
            <ShieldCheck size={18} />
            <div>
              <strong>Protection acheteur active</strong>
              <p>
                Remboursement automatique si non livré avant le{" "}
                {order.refundDeadline
                  ? new Date(order.refundDeadline).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })
                  : "6 jours"}
                .
              </p>
            </div>
          </div>
        )}

        {qrDataUrl && isPaid && !isCashOnDelivery && (
          <div className={styles.qrSection}>
            <h2 className={styles.sectionTitle}>Votre QR de livraison</h2>
            <p className={styles.qrHint}>
              Présentez ce code au marchand uniquement lorsque vous êtes satisfait
              de votre commande.
            </p>
            <div className={styles.qrFrame}>
              <img src={qrDataUrl} alt="QR livraison" className={styles.qrImage} />
            </div>
            <div className={styles.qrActions}>
              <button
                type="button"
                className={styles.qrBtn}
                onClick={handleDownloadQR}
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Download size={14} />
                Télécharger PNG
              </button>
              <a
                href={order.qrDownloadSvgUrl}
                className={styles.qrBtnSecondary}
                download
              >
                Télécharger SVG
              </a>
              {order.customerEmail && (
                <button
                  type="button"
                  className={styles.qrBtnSecondary}
                  onClick={handleSendEmail}
                  disabled={emailSending || emailSent}
                >
                  {emailSending ? (
                    <Loader2 size={14} className={styles.spin} />
                  ) : (
                    <Mail size={14} />
                  )}
                  {emailSent ? "Email envoyé" : "Envoyer par email"}
                </button>
              )}
            </div>
            {emailError && (
              <p className={styles.emailError}>{emailError}</p>
            )}
          </div>
        )}

        <div className={styles.recapSection}>
          <h2 className={styles.sectionTitle}>Récapitulatif</h2>
          {order.items.map((item) => (
            <div key={`${item.name}-${item.quantity}`} className={styles.recapRow}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>
                {(item.price * item.quantity).toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          ))}
          {order.shippingPrice > 0 && (
            <div className={styles.recapRow}>
              <span>Livraison</span>
              <span>{order.shippingPrice.toLocaleString("fr-FR")} FCFA</span>
            </div>
          )}
          {order.feesAdded > 0 && (
            <div className={styles.recapRowMuted}>
              <span>Frais opérateur</span>
              <span>+{order.feesAdded.toLocaleString("fr-FR")} FCFA</span>
            </div>
          )}
          <div className={styles.recapTotal}>
            <span>Total</span>
            <strong>{order.total.toLocaleString("fr-FR")} FCFA</strong>
          </div>
        </div>

        <div className={styles.footerActions}>
          <Link
            href={`/shop/${order.shop.slug}`}
            className={styles.backLink}
            style={{ color: primaryColor }}
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
