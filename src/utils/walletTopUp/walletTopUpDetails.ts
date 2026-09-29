import { fileNameFromUrl } from '@/utils/urlUtils';
import type {
  WalletCurrencyMetadata,
  WalletOperation,
} from '@/types/walletAdminApi';
import { getProductLabel } from '@/constants/platform';

import {
  formatTopUpDetailsDate,
  formatTopUpProofFileSize,
  formatWalletAmountMinor,
  hasWalletAmountMinor,
} from './walletTopUpFormatters';
import {
  mapOperationStatusToDisplay,
  mapSourceTypeToMethod,
  resolveOperationReference,
} from './walletTopUpMappers';
import type {
  TopUpDisplayStatus,
  TopUpHistoryEntry,
  TopUpMethodDisplay,
} from './walletTopUpTypes';

export const TOP_UP_DETAILS_EMPTY_VALUE = '-';

export type TopUpProofFile = {
  fileName: string;
  fileSizeLabel: string | null;
  downloadUrl: string | null;
};

export type TopUpDetailsTextField = {
  key: string;
  label: string;
  value: string;
  kind: 'text';
};

export type TopUpDetailsStatusField = {
  key: string;
  label: string;
  value: string;
  kind: 'status';
  status: TopUpDisplayStatus;
};

export type TopUpDetailsBadgeField = {
  key: string;
  label: string;
  value: string;
  kind: 'badge';
};

export type TopUpDetailsField =
  | TopUpDetailsTextField
  | TopUpDetailsStatusField
  | TopUpDetailsBadgeField;

export type TopUpDetailsViewModel = {
  fields: TopUpDetailsField[];
  proofFile: TopUpProofFile | null;
};

type Translate = (key: string) => string;

const PROOF_NESTED_KEYS = [
  'proof',
  'proofOfPayment',
  'proof_of_payment',
  'file',
  'attachment',
] as const;

const PROOF_FILE_NAME_KEYS = [
  'fileName',
  'file_name',
  'name',
  'originalFileName',
  'original_file_name',
  'proofFileName',
  'proof_file_name',
] as const;

const PROOF_URL_KEYS = [
  'url',
  'downloadUrl',
  'download_url',
  'fileUrl',
  'file_url',
  'signedUrl',
  'signed_url',
] as const;

const PROOF_SIZE_KEYS = ['fileSize', 'file_size', 'size'] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pickString(
  source: Record<string, unknown> | null,
  keys: readonly string[],
): string | null {
  if (!source) {
    return null;
  }
  for (const key of keys) {
    const found = asNonEmptyString(source[key]);
    if (found) {
      return found;
    }
  }
  return null;
}

function pickUnknown(
  source: Record<string, unknown> | null,
  keys: readonly string[],
): unknown {
  if (!source) {
    return undefined;
  }
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }
  return undefined;
}

function nestedProofRecord(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | null {
  if (!metadata) {
    return null;
  }
  for (const key of PROOF_NESTED_KEYS) {
    const nested = asRecord(metadata[key]);
    if (nested) {
      return nested;
    }
  }
  return metadata;
}

export function resolveTopUpProofFile(
  metadata: Record<string, unknown> | undefined,
): TopUpProofFile | null {
  const nested = nestedProofRecord(metadata);
  const fileName =
    pickString(nested, PROOF_FILE_NAME_KEYS) ??
    pickString(metadata ?? null, PROOF_FILE_NAME_KEYS);
  const downloadUrl =
    pickString(nested, PROOF_URL_KEYS) ??
    pickString(metadata ?? null, PROOF_URL_KEYS);
  const fileSizeLabel = formatTopUpProofFileSize(
    pickUnknown(nested, PROOF_SIZE_KEYS) ??
      pickUnknown(metadata ?? null, PROOF_SIZE_KEYS),
  );

  if (!fileName && !downloadUrl) {
    return null;
  }

  return {
    fileName: fileName ?? (downloadUrl ? fileNameFromUrl(downloadUrl) : 'file'),
    fileSizeLabel,
    downloadUrl,
  };
}

function displayOrDash(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : TOP_UP_DETAILS_EMPTY_VALUE;
}

function formatDetailsCurrency(
  currencyCode: string | undefined,
  currencies: Record<string, WalletCurrencyMetadata>,
): string {
  if (!currencyCode?.trim()) {
    return TOP_UP_DETAILS_EMPTY_VALUE;
  }
  const name = currencies[currencyCode]?.name?.trim();
  if (!name || name.toUpperCase() === currencyCode.toUpperCase()) {
    return currencyCode;
  }
  return `${currencyCode}- ${name}`;
}

function formatDetailsAmount(
  amountMinor: string | null | undefined,
  currencyCode: string | undefined,
  minorUnit: number,
): string {
  if (!hasWalletAmountMinor(amountMinor)) {
    return TOP_UP_DETAILS_EMPTY_VALUE;
  }
  const formatted = formatWalletAmountMinor(amountMinor, minorUnit);
  if (!currencyCode?.trim()) {
    return formatted;
  }
  return `${currencyCode} ${formatted}`;
}

function methodLabel(
  method: TopUpMethodDisplay | null | undefined,
  translate: Translate,
): string {
  if (!method) {
    return TOP_UP_DETAILS_EMPTY_VALUE;
  }
  return translate(`methods.${method}`);
}

export function toTopUpDetailsView(options: {
  entry: TopUpHistoryEntry;
  detail: WalletOperation | null;
  currencies: Record<string, WalletCurrencyMetadata>;
  translate: Translate;
  locale: string;
}): TopUpDetailsViewModel {
  const { entry, detail, currencies, translate, locale } = options;
  const matchingDetail = detail?.id === entry.id ? detail : null;
  const method = matchingDetail
    ? mapSourceTypeToMethod(matchingDetail.sourceType)
    : entry.method;
  const status = matchingDetail
    ? mapOperationStatusToDisplay(matchingDetail.status)
    : entry.status;
  const productCode = matchingDetail
    ? matchingDetail.targetWallet?.productCode?.trim() ||
      entry.productCode ||
      null
    : entry.productCode;
  const productDisplayLabel = getProductLabel(productCode);
  const amountMinor = matchingDetail?.amountMinor ?? entry.amountMinor;
  const currencyCode = matchingDetail?.currencyCode ?? entry.currencyCode;
  const minorUnit = entry.minorUnit;
  const reference = matchingDetail
    ? resolveOperationReference(matchingDetail)
    : entry.reference;
  const submittedAt = matchingDetail?.createdAt ?? entry.submittedAt;
  const reviewedAt = matchingDetail?.reviewedAt ?? entry.reviewedAt;

  const fields: TopUpDetailsField[] = [
    {
      key: 'method',
      kind: 'text',
      label: translate('detailsModal.fields.method'),
      value: methodLabel(method, translate),
    },
    {
      key: 'status',
      kind: 'status',
      label: translate('detailsModal.fields.status'),
      value: translate(`statuses.${status}`),
      status,
    },
    productDisplayLabel
      ? {
          key: 'product',
          kind: 'badge',
          label: translate('detailsModal.fields.product'),
          value: productDisplayLabel,
        }
      : {
          key: 'product',
          kind: 'text',
          label: translate('detailsModal.fields.product'),
          value: TOP_UP_DETAILS_EMPTY_VALUE,
        },
    {
      key: 'requestedAmount',
      kind: 'text',
      label: translate('detailsModal.fields.requestedAmount'),
      value: formatDetailsAmount(amountMinor, currencyCode, minorUnit),
    },
    {
      key: 'currency',
      kind: 'text',
      label: translate('detailsModal.fields.currency'),
      value: formatDetailsCurrency(currencyCode, currencies),
    },
    {
      key: 'transactionReference',
      kind: 'text',
      label: translate('detailsModal.fields.transactionReference'),
      value: displayOrDash(reference),
    },
    {
      key: 'floatBeforeApproval',
      kind: 'text',
      label: translate('detailsModal.fields.floatBeforeApproval'),
      value: formatDetailsAmount(
        matchingDetail?.balanceBeforeMinor ??
          matchingDetail?.currentBalanceMinor,
        currencyCode,
        minorUnit,
      ),
    },
    {
      key: 'floatAfterApproval',
      kind: 'text',
      label: translate('detailsModal.fields.floatAfterApproval'),
      value: formatDetailsAmount(
        matchingDetail?.balanceAfterMinor ??
          matchingDetail?.balanceAfterApprovalMinor,
        currencyCode,
        minorUnit,
      ),
    },
    {
      key: 'submittedOn',
      kind: 'text',
      label: translate('detailsModal.fields.submittedOn'),
      value: formatTopUpDetailsDate(submittedAt, locale),
    },
    {
      key: 'approvedOn',
      kind: 'text',
      label: translate('detailsModal.fields.approvedOn'),
      value: formatTopUpDetailsDate(reviewedAt, locale),
    },
  ];

  return {
    fields,
    proofFile: (() => {
      const signedUrl = matchingDetail?.proofDownloadUrl?.trim();
      if (signedUrl) {
        return {
          fileName: fileNameFromUrl(signedUrl),
          fileSizeLabel: null,
          downloadUrl: signedUrl,
        };
      }
      return resolveTopUpProofFile(matchingDetail?.metadata ?? entry.metadata);
    })(),
  };
}
