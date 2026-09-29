'use client';

import { useCallback, useState } from 'react';

import {
  GC_EMAIL_TEMPLATE_STATUS,
  mockGcEmailTemplate,
  type GcEmailTemplateMock,
} from '@/mock/rewardsPortalGcEmail';
import { useLocalization } from '@/hooks/useLocalization';

export type GcEmailDialog = 'approve' | 'reject' | 'preview' | null;

export function useGcEmailTab() {
  const { translate } = useLocalization('rewards-portal');
  const [template, setTemplate] = useState<GcEmailTemplateMock>(
    () => mockGcEmailTemplate,
  );
  const [activeDialog, setActiveDialog] = useState<GcEmailDialog>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const openApprove = useCallback(() => setActiveDialog('approve'), []);
  const openReject = useCallback(() => setActiveDialog('reject'), []);
  const openPreview = useCallback(() => setActiveDialog('preview'), []);

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setRejectionReason('');
  }, []);

  const confirmApprove = useCallback(() => {
    setTemplate((current) => ({
      ...current,
      status: GC_EMAIL_TEMPLATE_STATUS.APPROVED,
    }));
    setActiveDialog(null);
  }, []);

  const confirmReject = useCallback(() => {
    if (!rejectionReason.trim()) {
      return;
    }
    setTemplate((current) => ({
      ...current,
      status: GC_EMAIL_TEMPLATE_STATUS.REJECTED,
    }));
    setActiveDialog(null);
    setRejectionReason('');
  }, [rejectionReason]);

  const handleDownload = useCallback(() => {
    // Mock-only: no real file yet.
  }, []);

  const handleOpenPreviewLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.open(template.previewLink, '_blank', 'noopener,noreferrer');
    }
  }, [template.previewLink]);

  const isPending = template.status === GC_EMAIL_TEMPLATE_STATUS.PENDING;

  return {
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
  };
}
