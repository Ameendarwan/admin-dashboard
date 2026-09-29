'use client';

import { useGcEmailTab } from '../../hooks/useGcEmailTab';
import {
  GcEmailApproveModal,
  GcEmailRejectDialog,
  GcEmailTemplateCard,
  GcEmailTemplatePreviewDialog,
} from './components';

export function GcEmailTab() {
  const {
    translate,
    template,
    isPending,
    activeDialog,
    rejectionReason,
    setRejectionReason,
    openApprove,
    openReject,
    openPreview,
    closeDialog,
    confirmApprove,
    confirmReject,
    handleDownload,
    handleOpenPreviewLink,
  } = useGcEmailTab();

  return (
    <>
      <GcEmailTemplateCard
        template={template}
        isPending={isPending}
        translate={translate}
        onApprove={openApprove}
        onReject={openReject}
        onPreviewTemplate={openPreview}
        onDownload={handleDownload}
        onOpenPreviewLink={handleOpenPreviewLink}
      />

      <GcEmailApproveModal
        open={activeDialog === 'approve'}
        onClose={closeDialog}
        onConfirm={confirmApprove}
      />

      <GcEmailRejectDialog
        isOpen={activeDialog === 'reject'}
        reason={rejectionReason}
        onReasonChange={setRejectionReason}
        onClose={closeDialog}
        onConfirm={confirmReject}
      />

      <GcEmailTemplatePreviewDialog
        isOpen={activeDialog === 'preview'}
        template={template}
        onClose={closeDialog}
        onDownload={handleDownload}
      />
    </>
  );
}
