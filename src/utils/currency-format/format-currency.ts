export interface FormatCurrencyOptions {
  prefix?: string;
  suffix?: string;
  locale?: string;
  currency?: string;
  useIntl?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  separator?: string;
  compact?: false | "k" | "intl";
  compactMin?: number;
  compactFractionDigits?: number;
  compactMap?: Partial<Record<3 | 6 | 9 | 12, string>>;
  kOnly?: boolean;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(Math.max(n, lo), hi);

function resolveFractionDigits(
  num: number,
  userMin?: number,
  userMax?: number,
  fallbackFromNumber = false,
  fallbackMax = 0
) {
  let auto = 0;
  if (fallbackFromNumber && String(num).includes(".")) {
    const frac = String(num).split(".")[1];
    if (!/^0+$/.test(frac)) auto = frac.length;
  }

  let min = userMin ?? (fallbackFromNumber ? auto : 0);
  let max = userMax ?? (fallbackFromNumber ? Math.max(auto, fallbackMax) : fallbackMax);
  min = clamp(min, 0, 20);
  max = clamp(max, 0, 20);
  if (min > max) min = max;

  return { min, max };
}

export const formatCurrency = (
  amount: number,
  options: FormatCurrencyOptions = {}
) => {
  const {
    prefix = "",
    suffix = "",
    locale = "id-ID",
    currency,
    useIntl = false,
    minimumFractionDigits,
    maximumFractionDigits,
    separator,

    compact = false,
    compactMin = 1_000,
    compactFractionDigits = 1,
    compactMap,
    kOnly = false,
  } = options;

  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);

  const formatPlain = (num: number) => {
    const { min, max } = resolveFractionDigits(
      num,
      minimumFractionDigits,
      maximumFractionDigits,
       true,
       0
    );

    let out: string;
    if (useIntl && currency) {
      out = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: min,
        maximumFractionDigits: max,
      }).format(num);
    } else {
      out = new Intl.NumberFormat(locale, {
        minimumFractionDigits: min,
        maximumFractionDigits: max,
      }).format(num);
      out = `${prefix}${out}${suffix}`;
    }
    if (separator) out = out.replace(/[.,]/g, separator);
    return out.trim();
  };

  if (compact === "intl" && abs >= compactMin) {
    const { min, max } = resolveFractionDigits(
      amount,
      minimumFractionDigits,
      maximumFractionDigits,
       false,
      compactFractionDigits
    );

    const nf = new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
      ...(useIntl && currency
        ? {
            style: "currency" as const,
            currency,
            minimumFractionDigits: min,
            maximumFractionDigits: max,
          }
        : {
            minimumFractionDigits: min,
            maximumFractionDigits: max,
          }),
    });

    let out = nf.format(amount); 
    if (!(useIntl && currency)) {
      out = `${prefix}${out}${suffix}`;
    }
    if (separator) out = out.replace(/[.,]/g, separator);
    return out.trim();
  }

  if (compact === "k" && abs >= compactMin) {
    const { min, max } = resolveFractionDigits(
      abs,
       0,
       compactFractionDigits,
       false,
      compactFractionDigits
    );

    if (kOnly) {
      const value = abs / 1_000;
      const num = new Intl.NumberFormat(locale, {
        minimumFractionDigits: min,
        maximumFractionDigits: max,
      }).format(value);
      const out = `${sign}${prefix}${separator ? num.replace(/[.,]/g, separator) : num}K${suffix}`;
      return out.trim();
    }

    const units = [
      { p: 12, label: (compactMap && compactMap[12]) || "T" },
      { p: 9, label: (compactMap && compactMap[9]) || "B" },
      { p: 6, label: (compactMap && compactMap[6]) || "M" },
      { p: 3, label: (compactMap && compactMap[3]) || "K" },
    ];
    const hit = units.find((u) => abs >= Math.pow(10, u.p));
    if (hit) {
      const value = abs / Math.pow(10, hit.p);
      const num = new Intl.NumberFormat(locale, {
        minimumFractionDigits: min,
        maximumFractionDigits: max,
      }).format(value);
      const out = `${sign}${prefix}${separator ? num.replace(/[.,]/g, separator) : num}${hit.label}${suffix}`;
      return out.trim();
    }
  }
  return `${sign ? "-" : ""}${formatPlain(abs)}`;
};
