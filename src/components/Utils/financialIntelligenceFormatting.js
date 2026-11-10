export const MISSING_VALUE = "—";

const getLocale = (locale) =>
  locale || (typeof navigator !== "undefined" ? navigator.language : "en");

export const formatNumber = (value, { locale, ...options } = {}) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return MISSING_VALUE;
  }
  return new Intl.NumberFormat(getLocale(locale), options).format(value);
};

export const formatCurrency = (
  value,
  { locale, currency, maximumFractionDigits = 2 } = {},
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return MISSING_VALUE;
  }
  const resolvedLocale = getLocale(locale);
  if (!currency) {
    return formatNumber(value, { locale: resolvedLocale, maximumFractionDigits });
  }
  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency,
      maximumFractionDigits,
    }).format(value);
  } catch {
    return formatNumber(value, { locale: resolvedLocale, maximumFractionDigits });
  }
};

export const formatPercentage = (
  value,
  { locale, fraction = false, maximumFractionDigits = 0 } = {},
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return MISSING_VALUE;
  }
  const percentage = value * (fraction ? 100 : 1);
  return `${formatNumber(percentage, { locale, maximumFractionDigits })}%`;
};

export const formatDate = (value, { locale, options } = {}) => {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return MISSING_VALUE;
  }
  return new Intl.DateTimeFormat(getLocale(locale), options).format(new Date(value));
};
