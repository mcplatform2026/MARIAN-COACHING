export const AUTHORIZED_EMAILS = [
  "jeff@mariancoaching.com",
  "jeffrey.marian@gmail.com",
  "mcplatform2026@gmail.com"
] as const;

export function isEmailAuthorized(email?: string | null): boolean {
  if (!email) return false;
  return (AUTHORIZED_EMAILS as readonly string[]).includes(email.toLowerCase().trim());
}
