'use client';

import { Button, InputField, Popup } from '@merit-incentives/ui';
import { useEffect, useId, useState } from 'react';

import { useLocalization } from '@/hooks/useLocalization';

const FORM_ID = 'edit-subcategory-form';

interface EditSubcategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategoryId: string | null;
  subcategoryId: string | null;
  initialName: string;
  onSave?: (payload: {
    parentCategoryId: string;
    subcategoryId: string;
    name: string;
  }) => void | Promise<void>;
}

export function EditSubcategoryDialog({
  isOpen,
  onClose,
  parentCategoryId,
  subcategoryId,
  initialName,
  onSave,
}: Readonly<EditSubcategoryDialogProps>) {
  const formTitleId = useId();
  const { translate } = useLocalization('catalog');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName.trim());
    }
  }, [isOpen, initialName]);

  const trimmed = name.trim();
  const hasChanges = trimmed !== initialName.trim();
  const canSubmit =
    trimmed.length > 0 &&
    hasChanges &&
    parentCategoryId !== null &&
    subcategoryId !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !parentCategoryId || !subcategoryId || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await onSave?.({
        parentCategoryId,
        subcategoryId,
        name: trimmed,
      });
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
          {translate('categoryManagement.editSubcategoryDialog.title')}
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
            {translate('categoryManagement.editSubcategoryDialog.save')}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
