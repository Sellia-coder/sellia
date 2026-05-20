import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { computePayoutFees } from "@/lib/cartevo/pricing";
import { syncShopCartevoBalance } from "@/lib/cartevo/sync-balance";
import BalanceCard from "./BalanceCard";

export const dynamic = "force-dynamic";

export default async function PaiementsBalances() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      country: true,
      cartevoPayinBalance: true,
      cartevoPayoutBalance: true,
      cartevoBalanceUpdatedAt: true,
      plan: true,
    },
  });

  if (!shop) {
    return (
      <div className="dash-page-header">
        <p className="dash-page-subtitle">Aucune boutique trouvée.</p>
      </div>
    );
  }

  await syncShopCartevoBalance(shop.id);

  const refreshed = await db.shop.findUnique({
    where: { id: shop.id },
    select: {
      cartevoPayinBalance: true,
      cartevoPayoutBalance: true,
      cartevoBalanceUpdatedAt: true,
    },
  });

  const payin = Number(refreshed?.cartevoPayinBalance ?? 0);
  const payout = Number(refreshed?.cartevoPayoutBalance ?? 0);
  const country = shop.country || "CM";

  const projection = computePayoutFees({
    requestedAmount: payin,
    country,
    operator: "mtn",
  });

  return (
    <>
      <div className="dash-page-header dash-animate-fade-up">
        <div className="dash-page-header-left">
          <div className="dash-page-eyebrow">— Finances</div>
          <h1 className="dash-page-title">Mes paiements</h1>
          <p className="dash-page-subtitle">
            Suivez vos collectes et planifiez vos retraits vers Mobile Money.
          </p>
        </div>
        <div className="dash-page-actions">
          <Link href="/dashboard/paiements/pending" className="dash-btn dash-btn-secondary">
            Paiements en attente
          </Link>
        </div>
      </div>

      <div
        className="dash-stats-grid"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <BalanceCard
          shopId={shop.id}
          title="Solde collecté"
          subtitle="Argent reçu de vos clients"
          amount={payin}
          color="#16A34A"
          balanceKey="payin"
          projection={projection}
          country={country}
        />
        <BalanceCard
          shopId={shop.id}
          title="Solde en attente de retrait"
          subtitle="Déjà destiné à un payout"
          amount={payout}
          color="#2563EB"
          balanceKey="payout"
          country={country}
        />
      </div>

      {refreshed?.cartevoBalanceUpdatedAt && (
        <p
          className="dash-text-muted"
          style={{ fontSize: 12, marginTop: 12 }}
        >
          Mis à jour{" "}
          {new Date(refreshed.cartevoBalanceUpdatedAt).toLocaleString("fr-FR")}
        </p>
      )}
    </>
  );
}
