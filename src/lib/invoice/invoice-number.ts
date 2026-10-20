/**
 * Generates a readable invoice number such as "INV-20261020-K7Q2".
 * The suffix is random, so numbers created in different sessions do not collide in practice;
 * uniqueness is enforced by the database once persistence is added.
 */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `INV-${y}${m}${d}-${suffix}`;
}
