"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  Package,
  Calendar,
} from "lucide-react";
import styles from "./confirmation.module.css";

interface Props {
  order: any;
}

export default function OrderConfirmation({ order }: Props) {
  const primaryColor = order.shop.primaryColor ?? "#E84B1F";
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isCashOnDelivery = order.paymentMethod === "cash_on_delivery";

  useEffect(() => {
    if (!order.qrCode || isCashOnDelivery) return;

    const qrPayload = JSON.stringify({
      orderId: order.orderNumber,
      qr: order.qrCode,
      shop: order.shop.slug,
      total: order.total,
      issuedAt: new Date().toISOString(),
    });

    import("qrcode")
      .then((QRCode) =>
        QRCode.toDataURL(qrPayload, {
          width: 400,
          margin: 2,
          color: { dark: "#0A0E13", light: "#FFFFFF" },
          errorCorrectionLevel: "H",
        })
      )
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR generation failed", err));
  }, [order, isCashOnDelivery]);

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-code-${order.orderNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              ? "Commande confirmée !"
              : "Paiement réussi !"}
          </h1>
          <p className={styles.successSubtitle}>
            {isCashOnDelivery
              ? "Le marchand vous contactera bientôt pour la livraison"
              : "Vos fonds sont sécurisés chez Sellia jusqu\u2019à la livraison"}
          </p>

          <div className={styles.orderNumber}>
            <span className={styles.orderNumberLabel}>N° de commande</span>
            <span className={styles.orderNumberValue}>
              {order.orderNumber}
            </span>
            <button
              type="button"
              className={styles.orderNumberCopy}
              onClick={handleCopyOrderNumber}
            >
              {copied ? (
                <Check size={14} strokeWidth={2.4} />
              ) : (
                <Copy size={14} strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>

        <div className={styles.layout}>
          {!isCashOnDelivery && (
            <div className={styles.qrSection}>
              <div className={styles.qrCard}>
                <div className={styles.qrHeader}>
                  <h2 className={styles.qrTitle}>
                    Votre QR code de validation
                  </h2>
                  <p className={styles.qrSubtitle}>
                    Présentez ce QR au marchand à la livraison. Sans lui, il ne
                    reçoit pas son paiement.
                  </p>
                </div>

                <div className={styles.qrImageWrap}>
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className={styles.qrImage}
                    />
                  ) : (
                    <div className={styles.qrLoading}>Génération...</div>
                  )}
                  <div
                    className={styles.qrLogo}
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShieldCheck size={18} strokeWidth={2.4} />
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.qrDownloadBtn}
                  onClick={handleDownloadQR}
                  disabled={!qrDataUrl}
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  }}
                >
                  <Download size={16} strokeWidth={2.2} />
                  Télécharger mon QR code
                </button>

                <div className={styles.qrInfo}>
                  <AlertCircle size={14} strokeWidth={2.2} />
                  <span>
                    Le QR est aussi envoyé par email
                    {order.customerEmail
                      ? ` à ${order.customerEmail}`
                      : ""}{" "}
                    et par SMS au {order.customerPhone}.
                  </span>
                </div>
              </div>

              <div className={styles.instructions}>
                <h3 className={styles.instructionsTitle}>
                  Comment ça se passe maintenant ?
                </h3>
                <ol className={styles.instructionsList}>
                  <li>
                    <strong>Conservez votre QR code</strong> précieusement.
                  </li>
                  <li>
                    Le marchand vous contactera pour{" "}
                    <strong>convenir de la livraison</strong>.
                  </li>
                  <li>
                    À la réception,{" "}
                    <strong>présentez votre QR</strong> au marchand qui le
                    scannera.
                  </li>
                  <li>
                    Une fois scanné,{" "}
                    <strong>le marchand reçoit son paiement</strong>.
                  </li>
                </ol>
                <div className={styles.refundInfo}>
                  <Calendar size={14} strokeWidth={2.2} />
                  <span>
                    Si non livré sous 6 jours, vous serez{" "}
                    <strong>automatiquement remboursé</strong>.
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.summarySection}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryCardTitle}>
                Détails de votre commande
              </h2>

              <div className={styles.summaryItems}>
                {Array.isArray(order.items) &&
                  order.items.map((item: any, i: number) => (
                    <div key={i} className={styles.summaryItem}>
                      <div className={styles.summaryItemImg}>
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} />
                        ) : null}
                      </div>
                      <div className={styles.summaryItemInfo}>
                        <span className={styles.summaryItemName}>
                          {item.name}
                        </span>
                        {item.variantLabel && (
                          <span className={styles.summaryItemVar}>
                            {item.variantLabel}
                          </span>
                        )}
                        <span className={styles.summaryItemQty}>
                          {item.quantity} ×{" "}
                          {item.price?.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span>Sous-total</span>
                <span>{order.subtotal.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Livraison</span>
                <span>
                  {(order.shippingPrice ?? 0).toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span
                  className={styles.summaryTotalAmount}
                  style={{ color: primaryColor }}
                >
                  {order.total.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            <div className={styles.deliveryCard}>
              <div className={styles.deliveryHeader}>
                <Package size={16} strokeWidth={2.2} />
                <span>Adresse de livraison</span>
              </div>
              <div className={styles.deliveryContent}>
                <strong>{order.customerName}</strong>
                {order.customerAddress && <span>{order.customerAddress}</span>}
                {order.customerCity && <span>{order.customerCity}</span>}
                <span className={styles.deliveryPhone}>
                  📞 {order.customerPhone}
                </span>
              </div>
            </div>

            <div className={styles.merchantContact}>
              <h3 className={styles.merchantContactTitle}>
                Besoin d&apos;aide ?
              </h3>
              <p className={styles.merchantContactDesc}>
                Contactez {order.shop.name}
              </p>
              <div className={styles.merchantContactActions}>
                {order.shop.whatsappNumber && (
                  <a
                    href={`https://wa.me/${order.shop.whatsappNumber.replace(/[^0-9]/g, "")}?text=Bonjour, j'ai une question sur ma commande ${order.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.merchantContactBtn}
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <MessageCircle size={14} strokeWidth={2.2} />
                    WhatsApp
                  </a>
                )}
                {order.shop.phone && (
                  <a
                    href={`tel:${order.shop.phone}`}
                    className={styles.merchantContactBtnGhost}
                  >
                    <Phone size={14} strokeWidth={2.2} />
                    Appeler
                  </a>
                )}
                {order.shop.email && (
                  <a
                    href={`mailto:${order.shop.email}`}
                    className={styles.merchantContactBtnGhost}
                  >
                    <Mail size={14} strokeWidth={2.2} />
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.backToShop}>
          <Link
            href={`/shop/${order.shop.slug}`}
            className={styles.backLink}
          >
            ← Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
