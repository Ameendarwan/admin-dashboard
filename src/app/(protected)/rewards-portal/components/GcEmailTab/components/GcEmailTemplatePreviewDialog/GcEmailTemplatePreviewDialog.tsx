'use client';

import { Download } from 'lucide-react';
import type { FormEvent } from 'react';

import { BaseDialog } from '@/components/BaseDialog';
import { useLocalization } from '@/hooks/useLocalization';
import type { GcEmailTemplateMock } from '@/mock/rewardsPortalGcEmail';

import { GcEmailPreviewContent } from '../GcEmailPreviewContent';

interface GcEmailTemplatePreviewDialogProps {
  isOpen: boolean;
  template: GcEmailTemplateMock;
  onClose: () => void;
  onDownload: () => void;
}

export function GcEmailTemplatePreviewDialog({
  isOpen,
  template,
  onClose,
  onDownload,
}: Readonly<GcEmailTemplatePreviewDialogProps>) {
  const { translate } = useLocalization('rewards-portal');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onDownload();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={translate('gcEmail.preview.title')}
      secondaryButtonText={translate('gcEmail.preview.back')}
      onSecondaryAction={onClose}
      submitButtonText={translate('gcEmail.preview.download')}
      submitButtonIcon={<Download className="h-4 w-4" aria-hidden />}
      submitButtonVariant="secondary"
      className="w-[min(100%,56rem)] max-w-[calc(100vw-2rem)]"
    >
      <div className="max-h-[60vh] overflow-y-auto rounded-xl bg-mds-black-50 p-4">
        <GcEmailPreviewContent template={template} />
      </div>
    </BaseDialog>
  );
}
