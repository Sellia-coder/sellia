import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/email/resend";
import { safeLogger } from "@/lib/security/redact";

/**
 * Emails transactionnels (G9.B) — best-effort.
 * Tous les envois sont non bloquants : un échec ne doit JAMAIS interrompre la
 * commande / le retrait. Branding cohérent avec src/lib/email/templates.ts.
 */

const baseUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://getsellia.com";

function fmt(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(n));
}

function cur(currency?: string | null): string {
  return !currency || currency === "XAF" ? "FCFA" : currency;
}

function maskPhone(phone?: string | null): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 2) return "••";
  return `${"•".repeat(Math.max(2, digits.length - 2))}${digits.slice(-2)}`;
}

function parseItems(items: unknown): Array<{
  productId: string | null;
  name: string;
  quantity: number;
  price: number;
  type: string;
}> {
  if (!Array.isArray(items)) return [];
  return items.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      productId: r.productId ? String(r.productId) : null,
      name: String(r.name ?? "Article"),
      quantity: Number(r.quantity ?? 1),
      price: Number(r.price ?? 0),
      type: String(r.type ?? "physical"),
    };
  });
}

/** Layout email premium (table-based, compatible clients mail). */
function layout(opts: {
  preheader?: string;
  heading: string;
  intro?: string;
  bodyHtml: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0E1116;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>` : ""}
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FAFAF7;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(14,17,22,0.06);">
        <tr><td style="padding:32px 40px 8px;">
          <div style="display:inline-block;background:#0E1116;color:#FAFAF7;padding:10px 18px;border-radius:8px;font-weight:700;letter-spacing:0.6px;font-size:18px;">Sellia</div>
        </td></tr>
        <tr><td style="padding:16px 40px 0;">
          <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;letter-spacing:-0.6px;color:#0E1116;">${opts.heading}</h1>
          ${opts.intro ? `<p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#4B5563;">${opts.intro}</p>` : ""}
        </td></tr>
        <tr><td style="padding:20px 40px 8px;">${opts.bodyHtml}</td></tr>
        <tr><td style="padding:0 40px;"><div style="height:1px;background:#E5E2DA;"></div></td></tr>
        <tr><td style="padding:24px 40px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:12px;color:#8B8E94;">Sellia — Décrivez ce que vous vendez. Encaissez aujourd'hui.</p>
          <p style="margin:0;font-size:11px;color:#B5B7BC;">© 2026 Sellia · Une marque de Fiable Technologies LLC</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#E84B1F;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:14px;padding:13px 22px;border-radius:10px;">${label}</a>`;
}

function itemsTable(
  items: Array<{ name: string; quantity: number; price: number }>,
  currency: string
): string {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;font-size:13.5px;color:#0E1116;">${i.name} <span style="color:#8B8E94;">× ${i.quantity}</span></td><td style="padding:8px 0;font-size:13.5px;color:#0E1116;text-align:right;white-space:nowrap;">${fmt(i.price * i.quantity)} ${currency}</td></tr>`
    )
    .join("");
  return `<table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">${rows}</table>`;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    safeLogger.warn("Resend not configured, skipping transactional email");
    return;
  }
  try {
    await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  } catch (err) {
    safeLogger.error("Transactional email send failed", {
      subject,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * A) NOUVELLE VENTE → MARCHAND (email du propriétaire de la boutique).
 */
export async function sendNewSaleMerchantEmail(orderId: string): Promise<void> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        total: true,
        items: true,
        shop: {
          select: {
            name: true,
            currency: true,
            owner: { select: { email: true } },
          },
        },
      },
    });
    const to = order?.shop.owner?.email?.trim();
    if (!order || !to) return;

    const currency = cur(order.shop.currency);
    const items = parseItems(order.items);
    const dashUrl = `${baseUrl()}/dashboard/commandes/${encodeURIComponent(order.orderNumber)}`;

    const body = `
      ${itemsTable(items, currency)}
      <div style="margin:14px 0;height:1px;background:#E5E2DA;"></div>
      <table width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr><td style="font-size:14px;font-weight:700;color:#0E1116;">Total</td><td style="font-size:16px;font-weight:800;color:#E84B1F;text-align:right;">${fmt(order.total)} ${currency}</td></tr>
      </table>
      <div style="margin:16px 0;background:#FAFAF7;border:1px solid #E5E2DA;border-radius:12px;padding:14px 16px;font-size:13px;color:#4B5563;">
        <div><strong style="color:#0E1116;">Client :</strong> ${order.customerName || "—"}</div>
        <div style="margin-top:4px;"><strong style="color:#0E1116;">Téléphone :</strong> ${order.customerPhone || "—"}</div>
        <div style="margin-top:4px;"><strong style="color:#0E1116;">Commande :</strong> ${order.orderNumber}</div>
      </div>
      <div style="text-align:center;margin-top:8px;">${button(dashUrl, "Voir la commande")}</div>`;

    await send(
      to,
      `Nouvelle vente sur ${order.shop.name} ! 🎉`,
      layout({
        preheader: `Commande ${order.orderNumber} — ${fmt(order.total)} ${currency}`,
        heading: `Nouvelle vente sur ${order.shop.name} !`,
        intro: "Vous venez de réaliser une vente. Voici le détail de la commande.",
        bodyHtml: body,
      })
    );
  } catch (err) {
    safeLogger.error("[email new-sale]", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * B) LIEN DE TÉLÉCHARGEMENT DIGITAL → ACHETEUR.
 * N'envoie que si la commande contient ≥1 produit digital. Les produits sans
 * digitalFileUrl sont listés avec une mention "bientôt disponible" (pas de lien).
 */
export async function sendDigitalDownloadEmail(orderId: string): Promise<void> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        customerEmail: true,
        items: true,
        shop: { select: { name: true, slug: true } },
      },
    });
    const to = order?.customerEmail?.trim();
    if (!order || !to) return;

    const digitalItems = parseItems(order.items).filter(
      (i) => (i.type || "physical") === "digital"
    );
    if (digitalItems.length === 0) return; // Pas de produit digital → pas d'email.

    const productIds = digitalItems
      .map((i) => i.productId)
      .filter((id): id is string => Boolean(id));

    const products =
      productIds.length > 0
        ? await db.product.findMany({
            where: { id: { in: productIds } },
            select: { name: true, digitalFileUrl: true },
          })
        : [];

    // Fallback : si aucun productId résolu, on liste par nom depuis le snapshot.
    const list: Array<{ name: string; url: string | null }> =
      products.length > 0
        ? products.map((p) => ({ name: p.name, url: p.digitalFileUrl || null }))
        : digitalItems.map((i) => ({ name: i.name, url: null }));

    const rows = list
      .map((d) =>
        d.url
          ? `<tr><td style="padding:12px 14px;border:1px solid #E5E2DA;border-radius:10px;font-size:14px;font-weight:600;color:#0E1116;">${d.name}</td><td style="padding:12px 0 12px 12px;text-align:right;white-space:nowrap;">${button(d.url, "Télécharger")}</td></tr>`
          : `<tr><td style="padding:12px 14px;border:1px dashed #E5E2DA;border-radius:10px;font-size:14px;font-weight:600;color:#0E1116;">${d.name}</td><td style="padding:12px 0 12px 12px;text-align:right;font-size:12.5px;color:#8B8E94;">Bientôt disponible</td></tr>`
      )
      .join('<tr><td style="height:8px;"></td></tr>');

    const orderUrl = `${baseUrl()}/shop/${order.shop.slug}/commande/${encodeURIComponent(order.orderNumber)}`;

    const body = `
      <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;">${rows}</table>
      <div style="text-align:center;margin-top:18px;">${button(orderUrl, "Voir ma commande")}</div>`;

    await send(
      to,
      `Vos téléchargements — ${order.shop.name}`,
      layout({
        preheader: "Vos fichiers sont prêts à être téléchargés.",
        heading: "Merci pour votre achat",
        intro:
          "Votre paiement est confirmé. Retrouvez ci-dessous vos téléchargements.",
        bodyHtml: body,
      })
    );
  } catch (err) {
    safeLogger.error("[email digital-download]", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * C) CONFIRMATION DE RETRAIT → MARCHAND.
 * mode "auto" : versement effectué. mode "pending" : en cours de validation agent.
 */
export async function sendWithdrawalEmail(params: {
  shopId: string;
  mode: "auto" | "pending";
  netAmount: number;
  withdrawalFee: number;
  currency?: string | null;
  phone?: string | null;
}): Promise<void> {
  try {
    const shop = await db.shop.findUnique({
      where: { id: params.shopId },
      select: { name: true, owner: { select: { email: true } } },
    });
    const to = shop?.owner?.email?.trim();
    if (!shop || !to) return;

    const currency = cur(params.currency);
    const heading =
      params.mode === "auto" ? "Retrait effectué" : "Retrait en cours de validation";
    const intro =
      params.mode === "auto"
        ? "Votre argent a été envoyé sur votre compte Mobile Money."
        : "Votre demande de retrait est en cours de validation par un agent (sous 15 minutes maximum). Vous serez payé sous peu.";

    const feeLine =
      params.withdrawalFee > 0
        ? `<tr><td style="padding:6px 0;font-size:13px;color:#6B7280;">Frais de retrait</td><td style="padding:6px 0;font-size:13px;color:#6B7280;text-align:right;">${fmt(params.withdrawalFee)} ${currency}</td></tr>`
        : `<tr><td style="padding:6px 0;font-size:13px;color:#16A34A;">Frais de retrait</td><td style="padding:6px 0;font-size:13px;color:#16A34A;text-align:right;">Gratuit</td></tr>`;

    const body = `
      <div style="background:#FAFAF7;border:1px solid #E5E2DA;border-radius:12px;padding:18px;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr><td style="padding:6px 0;font-size:14px;font-weight:700;color:#0E1116;">Montant reçu</td><td style="padding:6px 0;font-size:18px;font-weight:800;color:#E84B1F;text-align:right;">${fmt(params.netAmount)} ${currency}</td></tr>
          ${feeLine}
          <tr><td style="padding:6px 0;font-size:13px;color:#6B7280;">Compte Mobile Money</td><td style="padding:6px 0;font-size:13px;color:#0E1116;text-align:right;">${maskPhone(params.phone)}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#6B7280;">Date</td><td style="padding:6px 0;font-size:13px;color:#0E1116;text-align:right;">${new Date().toLocaleString("fr-FR")}</td></tr>
        </table>
      </div>`;

    await send(
      to,
      `${heading} — ${shop.name}`,
      layout({
        preheader: `${fmt(params.netAmount)} ${currency}`,
        heading,
        intro,
        bodyHtml: body,
      })
    );
  } catch (err) {
    safeLogger.error("[email withdrawal]", {
      shopId: params.shopId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * D) LIVRAISON CONFIRMÉE / FONDS LIBÉRÉS → MARCHAND.
 */
export async function sendDeliveryReleasedMerchantEmail(
  orderId: string
): Promise<void> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        shop: {
          select: {
            name: true,
            currency: true,
            owner: { select: { email: true } },
          },
        },
        payouts: {
          where: { payoutType: "ORDER_PHYSICAL" },
          select: { amount: true },
        },
      },
    });
    const to = order?.shop.owner?.email?.trim();
    if (!order || !to) return;

    const currency = cur(order.shop.currency);
    const amount = order.payouts.reduce((s, p) => s + Number(p.amount), 0);

    const body = `
      <div style="background:#DCFCE7;border:1px solid #BBF7D0;border-radius:12px;padding:18px;text-align:center;">
        <div style="font-size:13px;color:#15803D;font-weight:600;margin-bottom:6px;">Fonds disponibles au retrait</div>
        <div style="font-size:26px;font-weight:800;color:#15803D;">${fmt(amount)} ${currency}</div>
      </div>
      <p style="margin:16px 0 0;font-size:13.5px;color:#4B5563;line-height:1.6;">
        La livraison de la commande <strong>${order.orderNumber}</strong> a été confirmée par le client.
        Les fonds correspondants sont désormais disponibles dans votre solde.
      </p>
      <div style="text-align:center;margin-top:16px;">${button(`${baseUrl()}/dashboard/paiements`, "Voir mon solde")}</div>`;

    await send(
      to,
      `Livraison confirmée — ${order.shop.name}`,
      layout({
        preheader: "Vos fonds sont disponibles.",
        heading: "Livraison confirmée",
        intro: "Bonne nouvelle — vos fonds viennent d'être libérés.",
        bodyHtml: body,
      })
    );
  } catch (err) {
    safeLogger.error("[email delivery-released]", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
