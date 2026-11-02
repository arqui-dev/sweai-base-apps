export const formatMoney = (cents: number, currency: string, locale = "en-US"): string =>
  new Intl.NumberFormat(locale, { style: "currency", currency: currency.toUpperCase() }).format(
    cents / 100,
  );
