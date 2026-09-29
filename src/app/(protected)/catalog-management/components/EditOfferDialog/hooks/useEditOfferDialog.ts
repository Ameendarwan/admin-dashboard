'use client';

import { toast } from '@merit-incentives/ui';
import { useEffect, useMemo, useState } from 'react';

import { adminCatalogAxiosMessage } from '@/app/(protected)/catalog-management/utils/adminCatalogAxiosMessage';
import {
  editableComparableSame,
  offerEditableComparable,
  offerPriceInputInitialValue,
  parseNonNegativeStock,
  parseOfferMajorPrice,
  parseOfferMinorPriceFromInput,
  patchBodyFromEditableDiff,
  type OfferEditableComparable,
} from '@/app/(protected)/catalog-management/utils/editOfferDialogHelpers';
import { catalogOfferLifecycleMessageKey } from '@/app/(protected)/catalog-management/utils/listingStatusBadgeHelpers';
import { useLocalization } from '@/hooks/useLocalization';
import { patchCatalogOffer } from '@/services/catalogAdminService';
import type { EcommerceOfferStatus, OfferDetail } from '@/types/catalog';

const ADMIN_EDIT_OFFER_STATUSES: readonly (
  | 'ACTIVE'
  | 'INACTIVE'
  | 'EXPIRED'
)[] = ['ACTIVE', 'INACTIVE', 'EXPIRED'];

interface UseEditOfferDialogArgs {
  offer: OfferDetail;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

/** Form state, dirty/valid checks and submit wiring for the edit-offer dialog. */
export function useEditOfferDialog({
  offer,
  onClose,
  onSaved,
}: UseEditOfferDialogArgs) {
  const { translate } = useLocalization('catalog');

  const baseline = useMemo(() => offerEditableComparable(offer), [offer]);

  /** Offers already expired cannot change lifecycle from this dialog. */
  const lifecycleFrozen = baseline.status === 'EXPIRED';

  const [currency] = useState(() => baseline.currency.trim().toUpperCase());
  const [status, setStatus] = useState<EcommerceOfferStatus>(() => {
    if (baseline.status === 'EXPIRED') {
      return 'EXPIRED';
    }
    return ADMIN_EDIT_OFFER_STATUSES.includes(
      baseline.status as (typeof ADMIN_EDIT_OFFER_STATUSES)[number],
    )
      ? baseline.status
      : 'INACTIVE';
  });
  const [stockText, setStockText] = useState(() => String(baseline.stockTotal));
  const [priceText, setPriceText] = useState(() =>
    offerPriceInputInitialValue(offer),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const nextBaseline = offerEditableComparable(offer);
    let nextStatus: EcommerceOfferStatus = 'INACTIVE';
    if (nextBaseline.status === 'EXPIRED') {
      nextStatus = 'EXPIRED';
    } else if (
      ADMIN_EDIT_OFFER_STATUSES.includes(
        nextBaseline.status as (typeof ADMIN_EDIT_OFFER_STATUSES)[number],
      )
    ) {
      nextStatus = nextBaseline.status;
    }
    setStatus(nextStatus);
    setStockText(String(nextBaseline.stockTotal));
    setPriceText(offerPriceInputInitialValue(offer));
  }, [offer]);

  const statusOptions = useMemo(
    () =>
      ADMIN_EDIT_OFFER_STATUSES.map((value) => ({
        value,
        label: translate(catalogOfferLifecycleMessageKey(value)),
      })),
    [translate],
  );

  const comparableDraft = useMemo((): OfferEditableComparable | null => {
    const priceMinor = parseOfferMinorPriceFromInput(priceText);
    const stockTotal = parseNonNegativeStock(stockText);
    if (priceMinor === null || stockTotal === null) {
      return null;
    }
    const lifecycleStatus = lifecycleFrozen ? baseline.status : status;
    return {
      currency: baseline.currency,
      location: baseline.location,
      rawPrice: priceMinor,
      stockTotal,
      status: lifecycleStatus,
      startsUtc: baseline.startsUtc,
      endsUtc: baseline.endsUtc,
    };
  }, [baseline, lifecycleFrozen, priceText, status, stockText]);

  const dirty =
    comparableDraft !== null &&
    !editableComparableSame(baseline, comparableDraft);

  const formValid =
    comparableDraft !== null &&
    parseOfferMajorPrice(priceText) !== null &&
    parseNonNegativeStock(stockText) !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty || comparableDraft === null || !formValid) {
      return;
    }
    const priceMinor = parseOfferMinorPriceFromInput(priceText);
    const stockParsed = parseNonNegativeStock(stockText);
    if (priceMinor === null || stockParsed === null) {
      toast.error(translate('offerEdit.validation'));
      return;
    }
    const body = patchBodyFromEditableDiff({
      before: baseline,
      after: comparableDraft,
      parsedPriceMinor: priceMinor,
      parsedStock: stockParsed,
    });
    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await patchCatalogOffer(offer.id, body);
      toast.success(translate('offerEdit.savedToast'));
      await onSaved();
      onClose();
    } catch (err) {
      toast.error(adminCatalogAxiosMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    translate,
    currency,
    status,
    setStatus,
    stockText,
    setStockText,
    priceText,
    setPriceText,
    saving,
    statusOptions,
    lifecycleFrozen,
    dirty,
    formValid,
    handleSubmit,
  };
}
