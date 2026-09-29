'use client';

import { Button, Popup } from '@merit-incentives/ui/components';
import React, { useState } from 'react';

import { useLocalization } from '@/hooks/useLocalization';
import { FileUpload } from '@/components/FileUpload';

interface RejectQcPopupProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void>;
}

export function RejectQcPopup({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: Readonly<RejectQcPopupProps>) {
  const { translate } = useLocalization('order-details');
  const [file, setFile] = useState<File | null>(null);

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!file || isLoading) return;
    onConfirm(file);
    setFile(null);
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={handleClose}
      className="w-[612px] max-w-[calc(100%-2rem)]"
    >
      <Popup.Header onClose={handleClose} className="px-6 pt-5 pb-2">
        <h2 className="text-xl font-medium text-mds-black-900">
          {translate('rejectQcPopup.title')}
        </h2>
      </Popup.Header>
      <Popup.Content className="w-full px-6 pb-5 pt-0">
        <div className="space-y-5">
          <p className="text-sm font-medium text-mds-black-700">
            {translate('rejectQcPopup.description')}
          </p>

          <FileUpload
            label=""
            file={file}
            onFileChange={setFile}
            accept="image/jpeg,image/jpg,image/png,video/mp4"
            maxSizeInMB={5}
            requirementsText={translate('rejectQcPopup.formatsHint')}
          />
        </div>
      </Popup.Content>
      <Popup.Footer className="px-6 py-5">
        <div className="flex w-full min-w-0 flex-wrap gap-4 sm:flex-nowrap">
          <Button
            type="button"
            onClick={handleClose}
            variant="tertiary"
            disabled={isLoading}
            className="w-full min-w-0 border-2 border-mds-black-300 bg-transparent py-6 text-base font-medium text-mds-black-700 hover:bg-mds-black-50"
          >
            {translate('rejectQcPopup.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!file || isLoading}
            loading={isLoading}
            className={
              isLoading || file
                ? 'w-full min-w-0 border-2 border-red-600 bg-red-600 py-6 text-base font-medium text-white! hover:bg-red-700'
                : 'w-full min-w-0 cursor-not-allowed border-2 border-red-600 bg-white py-6 text-base font-medium hover:bg-red-50 disabled:opacity-100!'
            }
          >
            {translate('rejectQcPopup.confirm')}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
