import type {
  ListingRequestWorkflowStatus,
  ListingRequestRow,
} from '@/types/catalog';

import { collectProductImageUrls } from './catalogImageUrls';

export function readString(v: unknown): string | null {
  if (typeof v === 'string' && v.trim()) {
    return v.trim();
  }
  return null;
}

export function recordFromUnknown(v: unknown): Record<string, unknown> | null {
  if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

export function readWorkflowStatus(raw: unknown): ListingRequestWorkflowStatus {
  const s =
    typeof raw === 'string' || typeof raw === 'number'
      ? String(raw).toLowerCase()
      : '';
  if (s === 'pending') return 'pending';
  if (s === 'under_review') return 'under_review';
  if (s === 'live') return 'live';
  if (s === 'rejected') return 'rejected';
  return 'under_review';
}

export function isListingRequestWorkflowTerminal(
  workflowStatus: ListingRequestWorkflowStatus | undefined,
): boolean {
  return workflowStatus === 'live' || workflowStatus === 'rejected';
}

export function isListingRequestRowActionable(
  status: ListingRequestRow['status'],
): boolean {
  return status === 'pending_review';
}

export function listingRequestWorkflowStatusToUiStatus(
  raw: unknown,
): ListingRequestRow['status'] {
  const s =
    typeof raw === 'string' || typeof raw === 'number'
      ? String(raw).toLowerCase()
      : '';
  if (s === 'rejected') {
    return 'rejected';
  }
  if (s === 'live') {
    return 'approved';
  }
  return 'pending_review';
}

export function extractImageUrlsFromProductJson(
  productJson: Record<string, unknown> | null,
): string[] {
  if (!productJson) {
    return [];
  }
  return collectProductImageUrls(productJson);
}

export function readCategoryName(
  block: unknown,
): { id: string | null; name: string } | null {
  if (!block || typeof block !== 'object') {
    return null;
  }
  const o = block as { id?: unknown; name?: unknown };
  const id = typeof o.id === 'string' ? o.id : null;
  const name =
    typeof o.name === 'string' && o.name.trim() ? o.name.trim() : '—';
  return { id, name };
}
