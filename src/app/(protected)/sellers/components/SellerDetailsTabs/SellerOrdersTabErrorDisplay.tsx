'use client';

import React from 'react';

import { TableStateDisplay } from '@/components/TableStateDisplay';

import { sellerOrdersTabErrorDescription } from './sellerOrdersTabErrorDescription';

interface SellerOrdersTabErrorDisplayProps {
  readonly title: string;
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly retryButtonText: string;
}

export function SellerOrdersTabErrorDisplay({
  title,
  error,
  onRetry,
  retryButtonText,
}: SellerOrdersTabErrorDisplayProps) {
  return (
    <TableStateDisplay
      type="error"
      title={title}
      description={sellerOrdersTabErrorDescription(error)}
      showRetryButton
      onRetry={onRetry}
      retryButtonText={retryButtonText}
    />
  );
}
