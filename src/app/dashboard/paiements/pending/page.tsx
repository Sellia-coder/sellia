import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import PendingOrderRow from "./PendingOrderRow";

export const dynamic = "force-dynamic";

export default async function PendingPaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
  });

  if (!shop) {
    return (
      <div className="dash-page-header">
        <p className="dash-page-subtitle">Aucune boutique trouvée.</p>
      </div>
    );
  }

  const pendingOrders = await db.order.findMany({
    where: {
      shopId: shop.id,
      paymentStatus: "awaiting_confirmation",
    },
    include: {
      cartevoTransaction: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <Link href="/dashboard/paiements" className="dash-back-link">
            <ArrowLeft size={14} strokeWidth={2.2} />
            Retour aux paiements
          </Link>
          <div className="dash-page-eyebrow">— Finances</div>
          <h1 className="dash-page-title">Paiements en attente</h1>
          <p className="dash-page-subtitle">
            Commandes dont le paiement Mobile Money est en cours de vérification
            chez Cartevo. Le cron réconcilie automatiquement toutes les 30
            secondes.
          </p>
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="dash-card dash-animate-fade-up">
          <div
            className="dash-card-body"
            style={{ textAlign: "center", padding: "48px 24px" }}
          >
            <CheckCircle
              size={32}
              strokeWidth={1.5}
              style={{ color: "var(--dash-success)", marginBottom: 12 }}
            />
            <h3 className="dash-card-title">Tout est à jour</h3>
            <p className="dash-page-subtitle" style={{ margin: "8px auto 0" }}>
              Aucun paiement n&apos;est en attente de vérification.
            </p>
          </div>
        </div>
      ) : (
        <div className="dash-table-container dash-animate-fade-up">
          <div
            className="dash-card-body"
            style={{ borderBottom: "1px solid var(--dash-border)" }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                fontSize: 13,
                color: "var(--dash-text-secondary)",
                lineHeight: 1.5,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: "var(--dash-text-primary)" }}>
                  Comment ça marche ?
                </strong>
                <br />
                Ces paiements ont été initiés mais Cartevo n&apos;a pas encore
                confirmé leur succès. Cliquez sur « Vérifier maintenant » pour
                forcer une vérification immédiate.
              </div>
            </div>
          </div>
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Opérateur</th>
                  <th>Initiée</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <PendingOrderRow
                    key={order.id}
                    order={{
                      id: order.id,
                      orderNumber: order.orderNumber,
                      customerName: order.customerName,
                      customerPhone: order.customerPhone,
                      total: order.total,
                      createdAt: order.createdAt,
                      paymentSubMethod: order.paymentSubMethod,
                      cartevoTransaction: order.cartevoTransaction
                        ? {
                            id: order.cartevoTransaction.id,
                            cartevoTxId: order.cartevoTransaction.cartevoTxId,
                            status: order.cartevoTransaction.status,
                            operator: order.cartevoTransaction.operator,
                          }
                        : null,
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
