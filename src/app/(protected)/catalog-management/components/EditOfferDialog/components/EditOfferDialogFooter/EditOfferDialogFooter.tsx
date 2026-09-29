'use client';

import { Button } from '@merit-incentives/ui';

type TranslateFn = (
  key: string,
  values?: Record<string, string | number>,
) => string;

interface EditOfferDialogFooterProps {
  translate: TranslateFn;
  onClose: () => void;
  saving: boolean;
  dirty: boolean;
  formValid: boolean;
}

export function EditOfferDialogFooter({
  translate,
  onClose,
  saving,
  dirty,
  formValid,
}: Readonly<EditOfferDialogFooterProps>) {
  return (
    <div className="flex w-full items-center justify-between gap-4 border-t border-mds-black-100 px-6 py-4 sm:px-8">
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        className="min-w-[7.5rem]"
        disabled={saving}
      >
        {translate('offerEdit.cancel')}
      </Button>
      <Button
        type="submit"
        form="edit-offer-form"
        variant="primary"
        loading={saving}
        disabled={!dirty || !formValid || saving}
        className="min-w-[7.5rem]"
      >
        {translate('offerEdit.update')}
      </Button>
    </div>
  );
}
