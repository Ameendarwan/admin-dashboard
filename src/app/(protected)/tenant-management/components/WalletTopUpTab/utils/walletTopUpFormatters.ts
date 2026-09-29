/**
 * Format a minor-unit amount string for display using the currency's minorUnit.
 * Keeps amounts as strings end-to-end; only formats at the UI boundary.
 * Avoids Number/float so large minor-unit integers stay exact.
 */
function groupThousands(value: string): string {
  const parts: string[] = [];
  for (let end = value.length; end > 0; end -= 3) {
    parts.unshift(value.slice(Math.max(0, end - 3), end));
  }
  return parts.join(',');
}

export function hasWalletAmountMinor(
  amountMinor: string | undefined | null,
): amountMinor is string {
  return typeof amountMinor === 'string' && amountMinor.trim().length > 0;
}

export function formatWalletAmountMinor(
  amountMinor: string | undefined | null,
  minorUnit: number,
): string {
  const raw = amountMinor?.trim() ?? '0';
  const negative = raw.startsWith('-');
  const digits = (negative ? raw.slice(1) : raw).replace(/\D/g, '') || '0';

  const unit = Number.isFinite(minorUnit) && minorUnit >= 0 ? minorUnit : 0;
  const padded = digits.padStart(unit + 1, '0');

  let whole: string;
  let fraction: string | null = null;
  if (unit === 0) {
    whole = padded.replace(/^0+(?=\d)/, '') || '0';
  } else {
    whole = (padded.slice(0, -unit) || '0').replace(/^0+(?=\d)/, '') || '0';
    fraction = padded.slice(-unit);
  }

  const groupedWhole = groupThousands(whole);
  const formatted =
    fraction === null ? groupedWhole : `${groupedWhole}.${fraction}`;

  return negative ? `-${formatted}` : formatted;
}

/** Formats a minor-unit amount or returns a caller-provided unknown label. */
export function formatWalletAmountMinorOrUnknown(
  amountMinor: string | null | undefined,
  minorUnit: number,
  unknownLabel: string,
): string {
  if (!hasWalletAmountMinor(amountMinor)) {
    return unknownLabel;
  }
  return formatWalletAmountMinor(amountMinor, minorUnit);
}

export function formatTopUpSubmittedAt(
  isoDate: string,
  todayLabel: string,
  locale = 'en',
): string {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `${todayLabel}, ${time}`;
  }

  const datePart = date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `${datePart} ${time}`;
}

export function formatTopUpHistoryDate(isoDate: string, locale = 'en'): string {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${year}-${month}-${day} ${time}`;
}

const MISSING_DISPLAY = '-';

/** Figma top-up details dates: `26/06/2026 - 09:27 AM`. */
export function formatTopUpDetailsDate(
  isoDate: string | null | undefined,
  locale = 'en',
): string {
  if (!isoDate?.trim()) {
    return MISSING_DISPLAY;
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return MISSING_DISPLAY;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const time = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${day}/${month}/${year} - ${time}`;
}

export function formatTopUpProofFileSize(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (/[a-zA-Z]/.test(trimmed)) {
      return trimmed;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return formatByteCount(parsed);
  }

  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return formatByteCount(value);
  }

  return null;
}

function formatByteCount(bytes: number): string {
  if (bytes < 1024) {
    return `${Math.round(bytes)} B`;
  }
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(2)} KB`;
  }
  return `${(kilobytes / 1024).toFixed(2)} MB`;
}

/** Best-effort ISO-4217 → flagcdn country code for wallet cards. */
export function currencyCodeToFlagCountry(
  currencyCode: string,
): string | undefined {
  const map: Record<string, string> = {
    SAR: 'sa',
    AED: 'ae',
    USD: 'us',
    GBP: 'gb',
    EGP: 'eg',
    EUR: 'eu',
    KWD: 'kw',
    BHD: 'bh',
    QAR: 'qa',
    OMR: 'om',
    JOD: 'jo',
  };
  return map[currencyCode.toUpperCase()];
}
