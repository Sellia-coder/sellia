interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  shopName: string;
  shopSlug: string;
  total: number;
  subTotal: number;
  feesAdded: number;
  currency: string;
  paymentMethod: string;
  paidAt: Date;
  refundDeadline: Date;
  items: Array<{ name: string; quantity: number; price: number }>;
  qrUrl?: string;
  qrImageUrl?: string;
  orderViewUrl: string;
  shopUrl: string;
  /** QR de livraison uniquement pour commandes avec produits physiques */
  showDeliveryQr: boolean;
  merchantPhone?: string | null;
  primaryColor?: string;
}

function formatPrice(n: number, currency: string): string {
  const label = !currency || currency === "XAF" ? "FCFA" : currency;
  return `${n.toLocaleString("fr-FR")} ${label}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function renderOrderConfirmationEmail(data: OrderEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Commande confirmée — ${data.orderNumber} · ${data.shopName}`;
  const color = data.primaryColor ?? "#E84B1F";

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#0A0E13;font-family:Arial,sans-serif;">${item.name} × ${item.quantity}</td>
      <td style="padding:8px 0;font-size:14px;color:#0A0E13;text-align:right;font-family:Arial,sans-serif;">${formatPrice(item.price * item.quantity, data.currency)}</td>
    </tr>`
    )
    .join("");

  const introHtml = data.showDeliveryQr
    ? `<p style="margin:0 0 24px;font-size:14px;color:#6B6E76;line-height:1.6;">Votre paiement a été confirmé. Vos fonds sont protégés par Sellia jusqu'à la livraison.</p>`
    : `<p style="margin:0 0 24px;font-size:14px;color:#6B6E76;line-height:1.6;">Votre paiement a été confirmé. Votre commande est enregistrée chez ${data.shopName}.</p>`;

  const qrBlockHtml = data.showDeliveryQr
    ? `<div style="text-align:center;margin-bottom:24px;">
              <p style="font-size:13px;color:#6B6E76;margin:0 0 12px;">Présentez ce QR code au marchand à la livraison</p>
              <img src="${data.qrImageUrl}" alt="QR livraison" width="200" height="200" style="border:1px solid #ECE9E2;border-radius:12px;"/>
            </div>`
    : `<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;color:#334155;line-height:1.6;">
                <strong>Une réclamation ?</strong> Connectez-vous à votre espace sur la boutique
                (<a href="${data.shopUrl}" style="color:${color};text-decoration:none;font-weight:600;">${data.shopUrl}</a>)
                et ouvrez un litige depuis « Mes achats ».
              </p>
            </div>`;

  const protectionHtml = data.showDeliveryQr
    ? `<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
              <p style="margin:0;font-size:13px;color:#15803D;line-height:1.55;">
                <strong>Protection acheteur</strong> — Remboursement automatique si non livré avant le ${formatDate(data.refundDeadline)}.
              </p>
            </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:20px;border:1px solid #ECE9E2;overflow:hidden;max-width:560px;">
        <tr>
          <td style="background:${color};padding:28px 32px;text-align:center;">
            <div style="font-size:11px;font-weight:600;letter-spacing:1.5px;color:rgba(255,255,255,0.85);text-transform:uppercase;margin-bottom:8px;">Paiement confirmé</div>
            <div style="font-size:26px;font-weight:600;color:#FFFFFF;letter-spacing:-0.5px;">${data.shopName}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:15px;color:#0A0E13;">Bonjour <strong>${data.customerName}</strong>,</p>
            ${introHtml}

            <div style="background:#FAFAF7;border:1px solid #ECE9E2;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
              <div style="font-size:11px;color:#6B6E76;letter-spacing:0.5px;margin-bottom:4px;">N° DE COMMANDE</div>
              <div style="font-size:22px;font-weight:600;color:#0A0E13;letter-spacing:1px;font-family:monospace;">${data.orderNumber}</div>
            </div>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              ${itemsHtml}
              <tr><td colspan="2" style="border-top:1px solid #ECE9E2;padding-top:8px;"></td></tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#6B6E76;">Sous-total</td>
                <td style="padding:6px 0;font-size:13px;color:#6B6E76;text-align:right;">${formatPrice(data.subTotal, data.currency)}</td>
              </tr>
              ${
                data.feesAdded > 0
                  ? `<tr>
                <td style="padding:6px 0;font-size:13px;color:#6B6E76;">Frais opérateur</td>
                <td style="padding:6px 0;font-size:13px;color:#6B6E76;text-align:right;">+${formatPrice(data.feesAdded, data.currency)}</td>
              </tr>`
                  : ""
              }
              <tr>
                <td style="padding:8px 0;font-size:15px;font-weight:600;color:#0A0E13;">Total payé</td>
                <td style="padding:8px 0;font-size:15px;font-weight:600;color:#0A0E13;text-align:right;">${formatPrice(data.total, data.currency)}</td>
              </tr>
            </table>

            ${qrBlockHtml}
            ${protectionHtml}

            <div style="text-align:center;">
              <a href="${data.orderViewUrl}" style="display:inline-block;padding:12px 28px;background:${color};color:#FFFFFF;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">Voir ma commande</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#FAFAF7;border-top:1px solid #ECE9E2;text-align:center;">
            <p style="margin:0;font-size:12px;color:#8A8D95;">Sellia · Paiement sécurisé Mobile Money</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textIntro = data.showDeliveryQr
    ? `Vos fonds sont protégés jusqu'à la livraison.`
    : `Pour toute réclamation, connectez-vous à votre espace sur la boutique (${data.shopUrl}) et ouvrez un litige.`;

  const textQr = data.showDeliveryQr
    ? `\nQR livraison : ${data.qrUrl}\n\nProtection : remboursement automatique si non livré avant ${formatDate(data.refundDeadline)}.`
    : "";

  const text = `Commande confirmée — ${data.orderNumber}

Bonjour ${data.customerName},

Votre paiement de ${formatPrice(data.total, data.currency)} a été confirmé chez ${data.shopName}.
${textIntro}

Commande : ${data.orderNumber}
Voir : ${data.orderViewUrl}${textQr}
`;

  return { subject, html, text };
}

export type { OrderEmailData };
