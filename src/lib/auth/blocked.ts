/** Message affiché lorsqu'un compte marchand est suspendu par l'admin. */
export const BLOCKED_ACCOUNT_MESSAGE =
  "Votre compte a été suspendu. Contactez le support.";

/** Fail-safe : seul `isBlocked === true` bloque ; undefined/null = compte actif. */
export function isUserBlocked(user: { isBlocked?: boolean | null }): boolean {
  return user.isBlocked === true;
}
