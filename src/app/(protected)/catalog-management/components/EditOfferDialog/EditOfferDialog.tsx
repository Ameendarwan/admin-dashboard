'use client';

import { Popup } from '@merit-incentives/ui';

import type { OfferDetail } from '@/types/catalog';

import {
  EditOfferDialogFooter,
  EditOfferEditableFieldsSection,
  EditOfferReadOnlySection,
} from './components';
import { useEditOfferDialog } from './hooks';

interface EditOfferDialogProps {
  offer: OfferDetail;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export function EditOfferDialog({
  offer,
  onClose,
  onSaved,
}: Readonly<EditOfferDialogProps>) {
  const {
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
  } = useEditOfferDialog({ offer, onClose, onSaved });

  return (
    <Popup
      isOpen
      onClose={onClose}
      size="lg"
      closeOnOverlayClick
      className="w-[min(100%,42rem)] max-w-[calc(100vw-2rem)] overflow-hidden"
    >
      <Popup.Header onClose={onClose} showDivider className="px-6 py-5 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-tight text-mds-black-900 sm:text-3xl">
          {translate('offerEdit.title')}
        </h2>
      </Popup.Header>

      <Popup.Content
        showDivider
        className="max-h-[min(720px,calc(100vh-12rem))] overflow-x-hidden overflow-y-auto px-6 py-6 sm:px-8"
      >
        <form
          id="edit-offer-form"
          onSubmit={handleSubmit}
          className="min-w-0 space-y-8 overflow-hidden"
        >
          <EditOfferReadOnlySection translate={translate} offer={offer} />

          <EditOfferEditableFieldsSection
            translate={translate}
            lifecycleFrozen={lifecycleFrozen}
            statusOptions={statusOptions}
            status={status}
            onStatusChange={setStatus}
            currency={currency}
            priceText={priceText}
            onPriceTextChange={setPriceText}
            stockText={stockText}
            onStockTextChange={setStockText}
          />
        </form>
      </Popup.Content>

      <Popup.Footer className="p-0">
        <EditOfferDialogFooter
          translate={translate}
          onClose={onClose}
          saving={saving}
          dirty={dirty}
          formValid={formValid}
        />
      </Popup.Footer>
    </Popup>
  );
}
