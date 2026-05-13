/**
 * IP whitelist pour le webhook Cartevo.
 *
 * État actuel : DÉSACTIVÉ (Cartevo n'a pas fourni d'IPs fixes).
 * Quand ils en fournissent, remplir CARTEVO_WEBHOOK_IPS dans .env.
 */

export function isIpWhitelisted(ip: string): boolean {
  const whitelist = process.env.CARTEVO_WEBHOOK_IPS;
  if (!whitelist || whitelist.trim().length === 0) {
    return true;
  }

  const allowedIps = whitelist.split(",").map((s) => s.trim()).filter(Boolean);
  if (allowedIps.length === 0) return true;

  for (const allowed of allowedIps) {
    if (allowed.includes("/")) {
      if (matchCidr(ip, allowed)) return true;
    } else {
      if (ip === allowed) return true;
    }
  }

  return false;
}

function matchCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr, 10);
  if (isNaN(bits)) return false;

  const ipNum = ipToNumber(ip);
  const rangeNum = ipToNumber(range);
  if (ipNum === null || rangeNum === null) return false;

  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipNum & mask) === (rangeNum & mask);
}

function ipToNumber(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let num = 0;
  for (let i = 0; i < 4; i++) {
    const n = parseInt(parts[i]!, 10);
    if (isNaN(n) || n < 0 || n > 255) return null;
    num = (num << 8) | n;
  }
  return num >>> 0;
}
