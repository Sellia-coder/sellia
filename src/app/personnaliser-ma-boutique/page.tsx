import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getActiveDraftShopAction } from "@/app/actions/personnalisation";
import { claimDraftShop } from "@/lib/draftShop/claim";
import PersonnalisationWizard from "@/components/personnalisation/PersonnalisationWizard";

export const metadata = {
  title: "Personnaliser ma boutique - Sellia",
  description: "Configure ta boutique en quelques étapes",
};

export default async function PersonnaliserMaBoutiquePage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/connexion");

  const existingShop = await db.shop.findFirst({
    where: {
      ownerId: user.id,
      OR: [{ status: "published" }, { isPublished: true }],
    },
    select: { id: true },
  });
  if (existingShop) redirect("/dashboard");

  let result = await getActiveDraftShopAction();

  // COUCHE 2 : re-claim de secours si aucun draft rattaché (réseau lent / claim raté)
  if (!result.ok || !result.draft) {
    const cookieStore = await cookies();
    const pendingDraftId = cookieStore.get("sellia_pending_draft")?.value;
    if (pendingDraftId) {
      await claimDraftShop(user.id, pendingDraftId).catch(() => {});
      result = await getActiveDraftShopAction();
    }
  }

  // Plus de redirect("/") : empty-state propre si vraiment aucun draft
  if (!result.ok || !result.draft) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF7",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "40px",
            maxWidth: "460px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(14,17,22,0.08)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              margin: "0 auto 20px",
              background: "linear-gradient(135deg, #E84B1F, #ff6b3d)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: "26px",
              marginBottom: "10px",
              color: "#0E1116",
            }}
          >
            Créons votre boutique
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#4B5563",
              marginBottom: "24px",
              lineHeight: 1.55,
            }}
          >
            Vous n&apos;avez pas encore de boutique générée. Décrivez votre activité
            et notre IA crée votre boutique en quelques secondes.
          </p>
          <Link
            href="/#hero-form"
            style={{
              display: "inline-block",
              background: "#E84B1F",
              color: "#FFFFFF",
              padding: "13px 28px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Générer ma boutique
          </Link>
        </div>
      </div>
    );
  }

  return <PersonnalisationWizard draft={result.draft} userEmail={user.email ?? ""} />;
}
