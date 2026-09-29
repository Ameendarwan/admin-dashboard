import type { ActivationRequestStatus } from '@/constants/rewards-portal/activationRequestStatus';
import {
  ACTIVATION_REQUEST_STATUSES,
  isTerminalActivationRequestStatus,
} from '@/constants/rewards-portal/activationRequestStatus';
import { ACTIVATION_REQUEST_LIST_ALL } from '@/types/rewards-portal/activationRequestsApi';
import { giftCardDetailFromApi } from '@/app/(protected)/gift-card-management/lib/giftCardDetailFromApi';
import { giftCardRowFromApi } from '@/app/(protected)/gift-card-management/lib/giftCardRowFromApi';
import { readCategoryPair } from '@/app/(protected)/catalog-management/lib/productCatalogPayload';
import type {
  ActivationRequestCardItem,
  ActivationRequestDetail,
  ActivationRequestRow,
} from '@/types/catalog';
import type {
  ActivationRequestDetailApi,
  ActivationRequestItemApi,
  ActivationRequestListItemApi,
  ActivationRequestStatusFilter,
} from '@/types/rewards-portal/activationRequestsApi';

export const ACTIVATION_REQUEST_SUMMARY_STORAGE_PREFIX =
  'merit:activation-request-summary:';

/** Sentinel for UI columns where the LiveOps API contract provides no value. */
const PLACEHOLDER = '-';

function displayOrPlaceholder(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : PLACEHOLDER;
}

function readOfferPriceBounds(offers: ReadonlyArray<Record<string, unknown>>): {
  min: string;
  max: string;
} {
  const prices = offers
    .map((offer) => offer.price)
    .filter(
      (price): price is number =>
        typeof price === 'number' && Number.isFinite(price),
    );

  if (prices.length === 0) {
    return { min: PLACEHOLDER, max: PLACEHOLDER };
  }

  return {
    min: String(Math.min(...prices)),
    max: String(Math.max(...prices)),
  };
}

function readListField(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed !== PLACEHOLDER ? trimmed : PLACEHOLDER;
}

function readBusinessOwnerInitial(email: string): string {
  if (email === PLACEHOLDER || email.length === 0) {
    return PLACEHOLDER;
  }
  return email.charAt(0).toUpperCase();
}

function formatDenominationTypeLabel(
  denominationType: 'open' | 'fixed',
): string {
  return denominationType === 'open' ? 'Open' : 'Fixed';
}

function formatPreferredDenominations(
  values: ReadonlyArray<number | string> | null | undefined,
): string | undefined {
  if (!values?.length) {
    return undefined;
  }

  const labels = values.map((value) => String(value).trim()).filter(Boolean);

  return labels.length > 0 ? labels.join(', ') : undefined;
}

export function activationRequestCardFromItem(
  item: ActivationRequestItemApi,
): ActivationRequestCardItem {
  const product = item.catalogProduct;
  const listRow = product ? giftCardRowFromApi(product) : null;
  const { min, max } = product
    ? readOfferPriceBounds(product.offers)
    : { min: PLACEHOLDER, max: PLACEHOLDER };

  // Prefer structured category/subCategory pair; fall back to raw categories array names.
  const categoryLabel = (() => {
    if (!product) {
      return PLACEHOLDER;
    }
    const { category, subCategory } = readCategoryPair(product);
    if (subCategory !== '—' && category !== '—') {
      return `${category} / ${subCategory}`;
    }
    if (category !== '—') {
      return category;
    }
    if (subCategory !== '—') {
      return subCategory;
    }
    const names = product.categories
      .map((categoryRow) => categoryRow.name?.trim())
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(' / ') : PLACEHOLDER;
  })();

  const name =
    listRow?.name ??
    (product?.title?.trim() || item.catalogProductId || PLACEHOLDER);
  const brand = listRow?.brand ?? product?.brand?.name?.trim() ?? PLACEHOLDER;
  const detail = product ? giftCardDetailFromApi(product) : null;
  const thumbnail = product?.thumbnail?.trim() || null;
  const expectedSpend =
    typeof item.forecastedQuantity === 'number' &&
    Number.isFinite(item.forecastedQuantity)
      ? String(item.forecastedQuantity)
      : PLACEHOLDER;

  return {
    id: item.id,
    name,
    brand,
    productId: item.catalogProductId,
    category: listRow?.category ?? categoryLabel,
    minDenomination: min,
    maxDenomination: max,
    denominationType: listRow
      ? formatDenominationTypeLabel(listRow.denominationType)
      : PLACEHOLDER,
    validity: displayOrPlaceholder(product?.validity ?? detail?.validity),
    deliveryMode: detail?.deliveryMode?.trim() || 'Email',
    redemption: displayOrPlaceholder(detail?.redemption),
    country: displayOrPlaceholder(product?.country ?? listRow?.countries),
    usageLimitation: displayOrPlaceholder(detail?.usageLimitations),
    expectedSpend,
    preferredDenominations: displayOrPlaceholder(
      formatPreferredDenominations(product?.denominationPreferred) ??
        detail?.preferredDenominations,
    ),
    status: item.status,
    imageUrl: thumbnail ?? detail?.imageUrl ?? null,
    imageInitials: listRow?.imageInitials ?? 'GC',
    imageColor: listRow?.imageColor ?? '#1D4ED8',
  };
}

export function activationRequestDetailFromApi(
  api: ActivationRequestDetailApi,
  listRow?: ActivationRequestRow | null,
): ActivationRequestDetail {
  const businessName = readListField(listRow?.tenantName);
  const businessOwnerEmail = (() => {
    const fromList = readListField(listRow?.businessOwnerEmail);
    if (fromList !== PLACEHOLDER) {
      return fromList;
    }
    const userId = api.submittedByUserId?.trim();
    return userId || PLACEHOLDER;
  })();

  return {
    id: api.id,
    status: api.status,
    submittedByUserId: api.submittedByUserId,
    tenantId: api.tenantId,
    businessName,
    businessOwnerEmail,
    businessOwnerInitial: readBusinessOwnerInitial(businessOwnerEmail),
    accountStatus: PLACEHOLDER,
    kybStatus: PLACEHOLDER,
    complianceFlag: PLACEHOLDER,
    activeCards: PLACEHOLDER,
    ordersLast30Days: PLACEHOLDER,
    floatBalance: PLACEHOLDER,
    cards: api.items.map(activationRequestCardFromItem),
    canClose: !isTerminalActivationRequestStatus(api.status),
    notes: api.notes,
  };
}

export function activationRequestRowFromApi(
  item: ActivationRequestListItemApi,
): ActivationRequestRow {
  return { ...item };
}

export function activationRequestDetailFromListRow(
  row: ActivationRequestRow,
): ActivationRequestDetail {
  return {
    id: row.id,
    status: row.status,
    submittedByUserId: row.submittedByUserId,
    tenantId: row.tenantId,
    businessName: row.tenantName,
    businessOwnerEmail: row.businessOwnerEmail,
    businessOwnerInitial:
      row.businessOwnerEmail !== '-' && row.businessOwnerEmail.length > 0
        ? row.businessOwnerEmail.charAt(0).toUpperCase()
        : '-',
    accountStatus: '-',
    kybStatus: '-',
    complianceFlag: '-',
    activeCards: '-',
    ordersLast30Days: '-',
    floatBalance: '-',
    cards: [],
    canClose: !isTerminalActivationRequestStatus(row.status),
    notes: row.notes,
  };
}

export function saveActivationRequestSummaryToSession(
  row: ActivationRequestRow,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(
    `${ACTIVATION_REQUEST_SUMMARY_STORAGE_PREFIX}${row.id}`,
    JSON.stringify(row),
  );
}

export function readActivationRequestSummaryFromSession(
  requestId: string,
): ActivationRequestRow | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = sessionStorage.getItem(
    `${ACTIVATION_REQUEST_SUMMARY_STORAGE_PREFIX}${requestId}`,
  );
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ActivationRequestRow;
  } catch {
    return null;
  }
}

export function activationRequestStatusFilterValue(
  filter: ActivationRequestStatusFilter,
): ActivationRequestStatus | undefined {
  return parseActivationRequestStatusFilter(filter);
}

export function parseActivationRequestStatusFilter(
  filter: string,
): ActivationRequestStatus | undefined {
  if (filter === ACTIVATION_REQUEST_LIST_ALL || !filter.trim()) {
    return undefined;
  }
  return ACTIVATION_REQUEST_STATUSES.includes(filter as ActivationRequestStatus)
    ? (filter as ActivationRequestStatus)
    : undefined;
}

export function parseActivationRequestTenantFilter(
  tenantId?: string,
): string | undefined {
  if (
    !tenantId ||
    tenantId === ACTIVATION_REQUEST_LIST_ALL ||
    !tenantId.trim()
  ) {
    return undefined;
  }
  return tenantId.trim();
}

type ActivationRequestTenantRow = Readonly<{
  tenantId: string;
  tenantName: string;
}>;

/** Collect unique tenantId → label pairs from activation request list rows. */
export function collectActivationRequestTenantOptions(
  rows: ReadonlyArray<ActivationRequestTenantRow>,
): Map<string, string> {
  const options = new Map<string, string>();

  for (const row of rows) {
    const tenantId = row.tenantId?.trim();
    if (!tenantId) {
      continue;
    }
    const tenantName = row.tenantName?.trim();
    options.set(
      tenantId,
      tenantName && tenantName !== PLACEHOLDER ? tenantName : tenantId,
    );
  }

  return options;
}

export function mergeActivationRequestTenantOptions(
  current: ReadonlyMap<string, string>,
  discovered: ReadonlyMap<string, string>,
): Map<string, string> | null {
  let changed = false;
  const next = new Map(current);

  for (const [tenantId, label] of discovered) {
    if (next.get(tenantId) !== label) {
      next.set(tenantId, label);
      changed = true;
    }
  }

  return changed ? next : null;
}
