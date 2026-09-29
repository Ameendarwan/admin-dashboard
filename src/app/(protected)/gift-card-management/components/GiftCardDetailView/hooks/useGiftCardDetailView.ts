'use client';

import { useState } from 'react';

export function useGiftCardDetailView() {
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

  return {
    termsDialogOpen,
    openTermsDialog: () => setTermsDialogOpen(true),
    closeTermsDialog: () => setTermsDialogOpen(false),
  };
}
