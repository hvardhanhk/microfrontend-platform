/** Cache formatters — Intl.NumberFormat construction is expensive */
const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  const key = `${locale}-${currency}`;
  if (!currencyFormatters.has(key)) {
    currencyFormatters.set(key, new Intl.NumberFormat(locale, { style: 'currency', currency }));
  }
  return currencyFormatters.get(key)!.format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}
