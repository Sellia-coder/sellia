"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CaretLeft,
  Phone,
  Envelope,
  MapPin,
  Copy,
  WhatsappLogo,
  CheckCircle,
  ShieldCheck,
} from "@phosphor-icons/react";
import {
  computeDisplayStatus,
  STATUS_CONFIG,
  getOrderTypeKind,
  formatPrice,
  type OrderItem,
} from "@/lib/order-status";
import styles from "./order-detail.module.css";

interface OrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerCity: string | null;
  customerAddress: string | null;
  customerNotes: string | null;
  subtotal: number;
  shippingPrice: number;
  shippingZone: string | null;
  shippingEta: string | null;
  total: number;
  operatorFee: number;
  paymentMethod: string;
  paymentSubMethod: string | null;
  paymentProvider: string | null;
  paymentStatus: string;
  status: string;
  qrCode: string | null;
  qrScannedAt: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  refundDeadline: string | null;
  whatsappContacted: boolean;
  items: OrderItem[];
  createdAt: string;
}

interface Props {
  orderNumber: string;
  currency: string;
  order: OrderData;
}

export default function OrderDetailClient({
  orderNumber,
  currency,
  order,
}: Props) {
  const [copied, setCopied] = useState(false);

  const orderForStatus = {
    paymentStatus: order.paymentStatus,
    status: order.status,
    qrScannedAt: order.qrScannedAt ? new Date(order.qrScannedAt) : null,
    paidAt: order.paidAt ? new Date(order.paidAt) : null,
    refundedAt: order.refundedAt ? new Date(order.refundedAt) : null,
    items: order.items,
  };
  const displayStatus = computeDisplayStatus(orderForStatus);
  const statusCfg = STATUS_CONFIG[displayStatus];
  const kind = getOrderTypeKind(order.items);

  // G4.B — La livraison physique est confirmée par le client via son code 6 chiffres.
  const awaitingDeliveryConfirmation =
    (displayStatus === "paid_pending_delivery" ||
      displayStatus === "in_delivery") &&
    (kind === "physical" || kind === "mixed");

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const formatDateLong = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const typeLabel = (t?: string) => {
    if (t === "digital") return "Digital";
    if (t === "service") return "Service";
    return "Physique";
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <Link href="/dashboard/commandes" className={styles.backLink}>
          <CaretLeft size={15} weight="bold" /> Toutes les commandes
        </Link>
      </div>

      <div className={styles.header}>
        <div>
          <div className={styles.orderNumberWrap}>
            <h1 className={styles.orderNumber}>{orderNumber}</h1>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className={styles.copyBtn}
            >
              <Copy size={13} weight="regular" />
              {copied && <span className={styles.copiedText}>Copié</span>}
            </button>
          </div>
          <p className={styles.subtitle}>
            Commande passée le {formatDateLong(order.createdAt)}
          </p>
        </div>
        <span
          className={styles.statusBadgeLarge}
          style={{ background: statusCfg.bg, color: statusCfg.color }}
        >
          <span
            className={styles.statusDot}
            style={{ background: statusCfg.color }}
          />
          {statusCfg.label}
        </span>
      </div>

      {awaitingDeliveryConfirmation && (
        <aside className={styles.payoutBanner} role="note">
          <div className={styles.payoutBannerIcon}>
            <ShieldCheck size={22} weight="duotone" />
          </div>
          <div className={styles.payoutBannerContent}>
            <h2 className={styles.payoutBannerTitle}>
              {order.paymentMethod === "cash_on_delivery"
                ? "Comment vous serez payé (à la livraison)"
                : "Comment vous serez payé"}
            </h2>
            {order.paymentMethod === "cash_on_delivery" ? (
              <>
                <p className={styles.payoutBannerLead}>
                  Cette commande est en <strong>paiement à la livraison</strong>.
                  Vous encaissez directement auprès du client lors de la remise du
                  colis.
                </p>
                <ol className={styles.payoutSteps}>
                  <li>Préparez et expédiez la commande au client.</li>
                  <li>
                    À la réception, le client vous règle en espèces ou Mobile Money
                    (selon votre accord).
                  </li>
                  <li>
                    Marquez la commande comme traitée dans votre suivi — aucun
                    reversement Sellia n&apos;est nécessaire pour ce mode.
                  </li>
                </ol>
              </>
            ) : (
              <>
                <p className={styles.payoutBannerLead}>
                  Le client a payé en ligne. Les fonds sont{" "}
                  <strong>sécurisés par Sellia</strong> (escrow) jusqu&apos;à
                  confirmation de la livraison — vous n&apos;avez rien à déclencher
                  manuellement.
                </p>
                <ol className={styles.payoutSteps}>
                  <li>Préparez et remettez la commande au client.</li>
                  <li>
                    À la réception, le client confirme avec son{" "}
                    <strong>code à 6 chiffres</strong> (reçu avec sa commande).
                  </li>
                  <li>
                    Dès cette confirmation, Sellia libère automatiquement votre
                    part vers votre <strong>solde disponible</strong>.
                  </li>
                </ol>
                {order.refundDeadline && !order.refundedAt && (
                  <p className={styles.payoutNote}>
                    Protection acheteur active jusqu&apos;au{" "}
                    {new Date(order.refundDeadline).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    — livrez dans ce délai pour une expérience sereine.
                  </p>
                )}
              </>
            )}
          </div>
        </aside>
      )}

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Articles ({order.items.length})
            </h2>
            <div className={styles.itemsList}>
              {order.items.map((item, idx) => (
                <div key={idx} className={styles.item}>
                  <div className={styles.itemImage}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <span className={styles.itemEmoji}>
                        {item.emoji || "📦"}
                      </span>
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemMeta}>
                      Quantité {item.quantity}
                      {item.type && (
                        <>
                          {" "}
                          ·{" "}
                          <span className={styles.itemType}>
                            {typeLabel(item.type)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.itemPrice}>
                    {formatPrice(item.price * item.quantity)} {currency}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.totals}>
              <div className={styles.totalLine}>
                <span>Sous-total</span>
                <span>
                  {formatPrice(order.subtotal)} {currency}
                </span>
              </div>
              {order.shippingPrice > 0 && (
                <div className={styles.totalLine}>
                  <span>
                    Livraison
                    {order.shippingZone ? ` (${order.shippingZone})` : ""}
                  </span>
                  <span>
                    {formatPrice(order.shippingPrice)} {currency}
                  </span>
                </div>
              )}
              {order.operatorFee > 0 && (
                <div className={styles.totalLine}>
                  <span>Frais opérateur</span>
                  <span>
                    {formatPrice(order.operatorFee)} {currency}
                  </span>
                </div>
              )}
              <div className={styles.totalLineFinal}>
                <span>Total payé</span>
                <strong>
                  {formatPrice(order.total + order.operatorFee)} {currency}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Paiement</h2>
            <div className={styles.paymentInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Méthode</span>
                <span className={styles.infoValue}>
                  {order.paymentMethod.replace(/_/g, " ")}
                </span>
              </div>
              {order.paymentSubMethod && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Opérateur</span>
                  <span className={styles.infoValue}>
                    {order.paymentSubMethod}
                  </span>
                </div>
              )}
              {order.paymentProvider && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Processeur</span>
                  <span className={styles.infoValue}>
                    {order.paymentProvider}
                  </span>
                </div>
              )}
              {order.paidAt && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Payé le</span>
                  <span className={styles.infoValue}>
                    {formatDateLong(order.paidAt)}
                  </span>
                </div>
              )}
              {order.refundDeadline && !order.refundedAt && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Délai protection</span>
                  <span
                    className={styles.infoValue}
                    style={{ color: "var(--sellia-warning)" }}
                  >
                    Jusqu&apos;au {formatDateLong(order.refundDeadline)}
                  </span>
                </div>
              )}
            </div>
          </section>

          {(kind === "physical" || kind === "mixed") && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Livraison</h2>
              <div className={styles.deliveryInfo}>
                {order.shippingZone && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Zone</span>
                    <span className={styles.infoValue}>
                      {order.shippingZone}
                    </span>
                  </div>
                )}
                {order.shippingEta && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Délai estimé</span>
                    <span className={styles.infoValue}>{order.shippingEta}</span>
                  </div>
                )}
                {order.qrScannedAt && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Livré le</span>
                    <span
                      className={styles.infoValue}
                      style={{ color: "var(--sellia-success)" }}
                    >
                      <CheckCircle
                        size={14}
                        weight="duotone"
                        style={{ verticalAlign: "middle", marginRight: 4 }}
                      />
                      {formatDateLong(order.qrScannedAt)}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className={styles.sideCol}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Client</h2>
            <div className={styles.customerInfo}>
              <div className={styles.customerNameBig}>
                {order.customerName}
              </div>
              <a
                href={`tel:${order.customerPhone}`}
                className={styles.customerContact}
              >
                <Phone size={13} weight="duotone" /> {order.customerPhone}
              </a>
              {order.customerEmail && (
                <a
                  href={`mailto:${order.customerEmail}`}
                  className={styles.customerContact}
                >
                  <Envelope size={13} weight="duotone" /> {order.customerEmail}
                </a>
              )}
              {(order.customerCity || order.customerAddress) && (
                <div className={styles.customerContact}>
                  <MapPin size={13} weight="duotone" />
                  <span>
                    {order.customerAddress && (
                      <>
                        {order.customerAddress}
                        <br />
                      </>
                    )}
                    {order.customerCity}
                  </span>
                </div>
              )}
              {order.customerNotes && (
                <div className={styles.customerNotes}>
                  <strong>Notes :</strong> {order.customerNotes}
                </div>
              )}
              <a
                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <WhatsappLogo size={14} weight="duotone" /> Contacter sur WhatsApp
              </a>
            </div>
          </section>
        </aside>
      </div>

    </div>
  );
}
