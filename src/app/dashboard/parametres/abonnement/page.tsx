import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SELLIA_PLANS } from "@/lib/cartevo/pricing";
import PlanCard from "./PlanCard";

export const dynamic = "force-dynamic";

export default async function AbonnementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const shop = await db.shop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      plan: true,
      proSince: true,
      businessSince: true,
      planRenewalAt: true,
    },
  });

  if (!shop) return null;

  const currentPlan = (shop.plan || "free") as "free" | "pro" | "business";

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <h1 className="dash-page-title">Mon abonnement</h1>
        <p className="dash-page-subtitle">
          Choisissez le plan adapté à votre activité. Vous pouvez changer à tout
          moment.
        </p>
      </div>

      {currentPlan !== "free" && shop.planRenewalAt && (
        <div className="dash-alert-info" style={{ marginBottom: 24 }}>
          <strong>Renouvellement :</strong> Votre plan{" "}
          {SELLIA_PLANS[currentPlan].name} sera renouvelé le{" "}
          {new Date(shop.planRenewalAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          .
        </div>
      )}

      <div
        className="dash-stats-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {(["free", "pro", "business"] as const).map((planId) => (
          <PlanCard
            key={planId}
            shopId={shop.id}
            plan={SELLIA_PLANS[planId]}
            isCurrent={currentPlan === planId}
            isUpgrade={
              (currentPlan === "free" && planId !== "free") ||
              (currentPlan === "pro" && planId === "business")
            }
          />
        ))}
      </div>
    </div>
  );
}
