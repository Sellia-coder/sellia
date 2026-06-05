"use client";

import { useTransition } from "react";
import {
  Eye,
  Globe,
  Pause,
  Play,
  Crown,
  Envelope,
} from "@phosphor-icons/react";
import AdminIconAction from "./AdminIconAction";
import {
  adminToggleShopVisibilityAction,
  adminChangeShopPlanAction,
} from "@/app/actions/admin-platform";
import { SELLIA_PLANS, type SelliaPlan } from "@/lib/cartevo/pricing";

export default function AdminShopRowActions({
  shopId,
  isPublished,
  publicUrl,
  ownerEmail,
  plan,
}: {
  shopId: string;
  isPublished: boolean;
  publicUrl: string;
  ownerEmail: string;
  plan: string;
}) {
  const [pending, startTransition] = useTransition();

  const changePlan = () => {
    const options = "free = Découverte (6 %)\npro = Pro (4 %)\nbusiness = Business (4 %)";
    const next = window
      .prompt(`Nouveau plan (free / pro / business) :\n\n${options}`, plan)
      ?.trim()
      .toLowerCase();
    if (!next || !["free", "pro", "business"].includes(next)) return;
    const cfg = SELLIA_PLANS[next as SelliaPlan];
    if (
      !window.confirm(
        `Passer cette boutique au plan ${cfg.name} (${cfg.commissionRate} % sur les ventes futures) ?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await adminChangeShopPlanAction(shopId, next as SelliaPlan);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  const toggle = () => {
    const msg = isPublished
      ? "Suspendre cette boutique ? Elle ne sera plus visible publiquement."
      : "Réactiver cette boutique et la republier ?";
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const res = await adminToggleShopVisibilityAction(shopId);
      if (!res.ok) alert(res.error ?? "Erreur");
    });
  };

  return (
    <div className="admin-icon-actions">
      <AdminIconAction
        href={`/admin/boutiques/${shopId}`}
        title="Voir les détails"
      >
        <Eye size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction href={publicUrl} external title="Voir la boutique publique">
        <Globe size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction
        onClick={toggle}
        disabled={pending}
        variant={isPublished ? "danger" : "ok"}
        title={isPublished ? "Suspendre la boutique" : "Réactiver la boutique"}
      >
        {isPublished ? (
          <Pause size={18} weight="duotone" />
        ) : (
          <Play size={18} weight="duotone" />
        )}
      </AdminIconAction>
      <AdminIconAction
        onClick={changePlan}
        disabled={pending}
        variant="primary"
        title={`Changer de plan (actuel : ${plan})`}
      >
        <Crown size={18} weight="duotone" />
      </AdminIconAction>
      <AdminIconAction
        href={`mailto:${ownerEmail}`}
        title="Contacter le propriétaire"
      >
        <Envelope size={18} weight="duotone" />
      </AdminIconAction>
    </div>
  );
}
