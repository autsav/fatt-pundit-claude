export type Currency = 'GBP' | 'AED';
export type Money = Partial<Record<Currency, number>>;

const formatters = new Map<string, Intl.NumberFormat>();

/** £7.50 / £26 for GBP; AED 45 for AED. Returns null when the dish has no price in that currency. */
export function formatPrice(price: Money | undefined, currency: Currency): string | null {
  const amount = price?.[currency];
  if (amount === undefined) return null;
  const whole = Number.isInteger(amount);
  const key = `${currency}-${whole}`;
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.NumberFormat(currency === 'GBP' ? 'en-GB' : 'en-AE', {
        style: 'currency',
        currency,
        minimumFractionDigits: whole ? 0 : 2,
        maximumFractionDigits: 2,
      }),
    );
  }
  return formatters.get(key)!.format(amount);
}

export const TAG_LABELS = {
  V: 'Vegetarian',
  VG: 'Vegan',
  GF: 'Gluten free',
  DF: 'Dairy free',
  H: 'Halal',
} as const;
