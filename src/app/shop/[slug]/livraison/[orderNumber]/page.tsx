import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifyOrderDeliverySignature } from "@/lib/qr/qr-signature";
import LivraisonClient from "./LivraisonClient";
import styles from "./livraison.module.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; orderNumber: string }>;
  searchParams: Promise<{ sig?: string }>;
}

export default async function LivraisonScanPage({ params, searchParams }: Props) {
  const { slug, orderNumber } = await params;
  const { sig } = await searchParams;
  const decoded = decodeURIComponent(orderNumber);

  if (!sig || !verifyOrderDeliverySignature({ orderNumber: decoded, shopSlug: slug, signature: sig })) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.titleInvalid}>Lien invalide</h1>
          <p className={styles.subtitle}>
            Ce QR code n&apos;est pas authentique ou a expiré. Demandez au client de
            régénérer son QR depuis sa confirmation de commande.
          </p>
        </div>
      </div>
    );
  }

  const order = await db.order.findFirst({
    where: { orderNumber: decoded, shop: { slug } },
    include: {
      shop: { select: { name: true, primaryColor: true } },
      cartevoTransaction: {
        select: {
          status: true,
          amount: true,
          operator: true,
          feeCartevo: true,
          feeSellia: true,
          netAmount: true,
        },
      },
    },
  });

  if (!order) notFound();

  const isPaid =
    order.paymentStatus === "paid_escrow" || order.paymentStatus === "delivered";
  const isDelivered = order.status === "delivered" || !!order.deliveredAt;
  const primaryColor = order.shop.primaryColor ?? "#E84B1F";

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.merchantBadge} style={{ borderColor: primaryColor }}>
          {order.shop.name}
        </div>

        <h1 className={styles.title}>
          {isDelivered ? "Livraison validée" : "Validation livraison"}
        </h1>

        <div className={styles.orderRef}>
          <span className={styles.orderRefLabel}>Commande</span>
          <code className={styles.orderRefValue}>{order.orderNumber}</code>
        </div>

        <div className={styles.customerBlock}>
          <div className={styles.row}>
            <span>Client</span>
            <strong>{order.customerName}</strong>
          </div>
          <div className={styles.row}>
            <span>Téléphone</span>
            <strong>{order.customerPhone}</strong>
          </div>
          <div className={styles.row}>
            <span>Montant</span>
            <strong>{order.total.toLocaleString("fr-FR")} FCFA</strong>
          </div>
          {order.cartevoTransaction && (
            <div className={styles.row}>
              <span>Opérateur</span>
              <strong>{order.cartevoTransaction.operator.toUpperCase()}</strong>
            </div>
          )}
        </div>

        {!isPaid ? (
          <div className={styles.alertWarning}>
            Paiement non confirmé — ne validez pas la livraison.
          </div>
        ) : isDelivered ? (
          <div className={styles.alertSuccess}>
            Cette commande a déjà été marquée comme livrée.
          </div>
        ) : (
          <LivraisonClient
            orderNumber={order.orderNumber}
            shopSlug={slug}
            signature={sig}
            primaryColor={primaryColor}
          />
        )}

        {order.cartevoTransaction && isPaid && (
          <div className={styles.feesDetail}>
            <div className={styles.feesTitle}>Détail marchand</div>
            <div className={styles.row}>
              <span>Frais opérateur</span>
              <span>
                -{Number(order.cartevoTransaction.feeCartevo).toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <div className={styles.row}>
              <span>Commission Sellia</span>
              <span>
                -{Number(order.cartevoTransaction.feeSellia).toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            <div className={styles.rowTotal}>
              <span>Net estimé</span>
              <strong>
                {Number(order.cartevoTransaction.netAmount).toLocaleString("fr-FR")} FCFA
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
