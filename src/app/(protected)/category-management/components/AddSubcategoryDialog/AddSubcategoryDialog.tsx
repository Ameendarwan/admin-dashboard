'use client';

import { Button, InputField, Popup } from '@merit-incentives/ui';
import { useEffect, useId, useState } from 'react';

import { useLocalization } from '@/hooks/useLocalization';

const FORM_ID = 'add-subcategory-form';

interface AddSubcategoryDialogProps {
  isOpen: boolean;
  /** Which category rows this subcategory is being added under; required when submitting. */
  parentCategoryId: string | null;
  onClose: () => void;
  onCreated?: (payload: {
    name: string;
    parentCategoryId: string;
  }) => void | Promise<void>;
}

export function AddSubcategoryDialog({
  isOpen,
  onClose,
  parentCategoryId,
  onCreated,
}: Readonly<AddSubcategoryDialogProps>) {
  const formTitleId = useId();
  const { translate } = useLocalization('catalog');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !parentCategoryId || submitting) return;
    setSubmitting(true);
    try {
      await onCreated?.({ name: trimmed, parentCategoryId });
      onClose();
    } catch {
      /* parent may show error toast */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick
      role="dialog"
      aria-labelledby={formTitleId}
      className="w-[min(100%,26rem)] max-w-[calc(100vw-2rem)]"
    >
      <Popup.Header onClose={onClose} showDivider className="px-6 py-5 sm:px-8">
        <h2
          id={formTitleId}
          className="text-lg font-semibold tracking-tight text-mds-black-900 sm:text-xl"
        >
          {translate('categoryManagement.subcategoryDialog.title')}
        </h2>
      </Popup.Header>

      <Popup.Content showDivider className="px-6 py-6 sm:px-8">
        <form id={FORM_ID} onSubmit={handleSubmit}>
          <InputField
            label={translate(
              'categoryManagement.subcategoryDialog.subcategoryNameLabel',
            )}
            placeholder={translate(
              'categoryManagement.subcategoryDialog.subcategoryNamePlaceholder',
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
        </form>
      </Popup.Content>

      <Popup.Footer className="p-0">
        <div className="flex w-full items-center justify-between gap-4 border-t border-mds-black-100 px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
            className="min-w-[7.25rem] rounded-xl border-transparent bg-mds-primary-50 !text-mds-primary-700 shadow-none hover:bg-mds-primary-100 hover:!text-mds-primary-900"
          >
            {translate('categoryManagement.subcategoryDialog.cancel')}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            loading={submitting}
            disabled={!canSubmit || submitting}
            className={`min-w-[7.25rem] rounded-xl ${
              canSubmit
                ? ''
                : '!border-0 !bg-mds-black-100 !text-mds-black-500 hover:!bg-mds-black-100 hover:!text-mds-black-500 cursor-not-allowed'
            }`}
          >
            {translate('categoryManagement.subcategoryDialog.create')}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
