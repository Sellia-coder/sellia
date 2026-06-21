/** Capitalise un prénom ou nom pour affichage (« emma » → « Emma », « marie-claire » → « Marie-Claire »). */
export function capitalizePersonalName(name: string | null | undefined): string {
  if (!name?.trim()) return "";

  return name
    .trim()
    .split(/([\s-]+)/)
    .map((part) => {
      if (!part || /^[\s-]+$/.test(part)) return part;
      const lower = part.toLocaleLowerCase("fr-FR");
      return lower.charAt(0).toLocaleUpperCase("fr-FR") + lower.slice(1);
    })
    .join("");
}

export function formatMerchantDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  emailFallback?: string
): string {
  const parts = [
    capitalizePersonalName(firstName),
    capitalizePersonalName(lastName),
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(" ");
  return emailFallback?.split("@")[0] ?? "";
}

export function merchantInitial(
  firstName: string | null | undefined,
  email: string
): string {
  const cap = capitalizePersonalName(firstName);
  return (cap.charAt(0) || email.charAt(0) || "?").toUpperCase();
}
