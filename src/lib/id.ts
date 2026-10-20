/**
 * Short client-side id for list keys (line items, custom fields).
 * crypto.randomUUID is only available in secure contexts, so fall back to Math.random
 * when the app is opened over plain HTTP on a LAN address.
 */
export function createId(prefix = "id"): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${random}`;
}
