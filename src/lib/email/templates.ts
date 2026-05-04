export function otpEmailTemplate(code: string, options?: { firstName?: string }): string {
  const firstName = options?.firstName ? options.firstName : "";
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Code de vérification Sellia</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0E1116;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FAFAF7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(14,17,22,0.06);">

          <!-- Header / Logo -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="display:inline-block;background:#0E1116;color:#FAFAF7;padding:10px 18px;border-radius:8px;font-weight:700;letter-spacing:0.6px;font-size:18px;">
                <span style="color:#E84B1F;">S</span>ellia
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:0 40px 8px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;letter-spacing:-0.6px;color:#0E1116;">
                Votre code de vérification
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:8px 40px 24px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#404552;">
                ${greeting} entrez ce code à 6 chiffres pour vérifier votre adresse email et finaliser la création de votre compte Sellia.
              </p>
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#FAFAF7;border:1px solid #E5E2DA;border-radius:12px;padding:28px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:500;letter-spacing:14px;color:#0E1116;">
                  ${code}
                </div>
                <div style="margin-top:12px;font-family:'SF Mono','Monaco','Consolas',monospace;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#8B8E94;font-weight:600;">
                  Valable 10 minutes
                </div>
              </div>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#8B8E94;">
                Si vous n'avez pas demandé ce code, ignorez cet email — votre compte reste protégé.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#E5E2DA;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#8B8E94;">
                Sellia — Décrivez ce que vous vendez. Encaissez aujourd'hui.
              </p>
              <p style="margin:0;font-size:11px;color:#B5B7BC;">
                © 2026 Sellia · Une marque de Rollo Technologies Inc.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function welcomeEmailTemplate(firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>Bienvenue sur Sellia</title></head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0E1116;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;border-radius:16px;box-shadow:0 4px 24px rgba(14,17,22,0.06);">
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="display:inline-block;background:#0E1116;color:#FAFAF7;padding:10px 18px;border-radius:8px;font-weight:700;letter-spacing:0.6px;font-size:18px;">
                <span style="color:#E84B1F;">S</span>ellia
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:28px;font-weight:400;letter-spacing:-0.6px;">
                Bienvenue ${firstName} 👋
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#404552;">
                Votre compte Sellia est prêt. Décrivez ce que vous vendez, et nous générerons votre boutique en ligne avec l'IA.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#404552;">
                Connectez-vous au dashboard pour commencer.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <a href="${process.env.APP_URL || "https://getsellia.com"}/dashboard" style="display:inline-block;background:#E84B1F;color:#FFFFFF;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                Aller au dashboard →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;border-top:1px solid #E5E2DA;">
              <p style="margin:0;font-size:11px;color:#B5B7BC;">© 2026 Sellia · Une marque de Rollo Technologies Inc.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function passwordResetEmailTemplate(code: string, options?: { firstName?: string }): string {
  const firstName = options?.firstName ? options.firstName : "";
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Réinitialisation de mot de passe Sellia</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0E1116;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FAFAF7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(14,17,22,0.06);">

          <!-- Logo -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="display:inline-block;background:#0E1116;color:#FAFAF7;padding:10px 18px;border-radius:8px;font-weight:700;letter-spacing:0.6px;font-size:18px;">
                <span style="color:#E84B1F;">S</span>ellia
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:0 40px 8px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;letter-spacing:-0.6px;color:#0E1116;">
                Réinitialisation de mot de passe
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:8px 40px 24px;">
              <p style="margin:0;font-size:15px;line-height:1.6;color:#404552;">
                ${greeting} vous avez demandé à réinitialiser votre mot de passe. Entrez ce code à 6 chiffres pour valider votre identité.
              </p>
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:#FAFAF7;border:1px solid #E5E2DA;border-radius:12px;padding:28px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:42px;font-weight:500;letter-spacing:14px;color:#0E1116;">
                  ${code}
                </div>
                <div style="margin-top:12px;font-family:'SF Mono','Monaco','Consolas',monospace;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#8B8E94;font-weight:600;">
                  Valable 10 minutes
                </div>
              </div>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#8B8E94;">
                Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre compte reste protégé.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#E5E2DA;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#8B8E94;">
                Sellia — Décrivez ce que vous vendez. Encaissez aujourd'hui.
              </p>
              <p style="margin:0;font-size:11px;color:#B5B7BC;">
                © 2026 Sellia · Une marque de Rollo Technologies Inc.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function passwordChangedEmailTemplate(options?: { firstName?: string; device?: string; location?: string }): string {
  const firstName = options?.firstName || "";
  const greeting = firstName ? `Bonjour ${firstName},` : "Bonjour,";
  const device = options?.device || "Appareil inconnu";
  const location = options?.location || "—";
  const date = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Mot de passe modifié — Sellia</title>
</head>
<body style="margin:0;padding:0;background:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0E1116;">
  <table width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;border-radius:16px;box-shadow:0 4px 24px rgba(14,17,22,0.06);">
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="display:inline-block;background:#0E1116;color:#FAFAF7;padding:10px 18px;border-radius:8px;font-weight:700;letter-spacing:0.6px;font-size:18px;">
                <span style="color:#E84B1F;">S</span>ellia
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 8px;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;letter-spacing:-0.6px;color:#0E1116;">
                ✓ Mot de passe modifié
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 24px;">
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#404552;">
                ${greeting} votre mot de passe Sellia vient d'être modifié avec succès.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background:#FAFAF7;border:1px solid #E5E2DA;border-radius:12px;padding:18px;">
                <div style="font-family:'SF Mono',Monaco,monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#8B8E94;font-weight:600;margin-bottom:8px;">Détails</div>
                <div style="font-size:13px;color:#404552;line-height:1.7;">
                  <strong>Date :</strong> ${date}<br>
                  <strong>Appareil :</strong> ${device}<br>
                  <strong>Lieu :</strong> ${location}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#8B8E94;">
                Vous n'êtes pas à l'origine de ce changement ? Contactez-nous immédiatement : <a href="mailto:support@getsellia.com" style="color:#E84B1F;text-decoration:none;">support@getsellia.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;border-top:1px solid #E5E2DA;">
              <p style="margin:0;font-size:11px;color:#B5B7BC;">© 2026 Sellia · Une marque de Rollo Technologies Inc.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
