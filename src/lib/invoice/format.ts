const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats an amount in integer cents as USD, e.g. 9900 → "$99.00". */
export function formatCents(cents: number): string {
  return usd.format(cents / 100);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  // Dates are stored as calendar dates (YYYY-MM-DD); format in UTC so the
  // server and every browser time zone render the same day.
  timeZone: "UTC",
});

/** Formats an ISO calendar date (YYYY-MM-DD) as "Oct 20, 2026". */
export function formatDate(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "—";
  const date = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function formatPercent(value: number): string {
  return `${Number.isFinite(value) ? Number(value.toFixed(3)) : 0}%`;
}
