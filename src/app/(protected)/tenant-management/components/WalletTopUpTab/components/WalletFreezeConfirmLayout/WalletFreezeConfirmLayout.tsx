'use client';

import type { ReactNode } from 'react';
import { Button, Popup } from '@merit-incentives/ui';
import { AlertCircle } from 'lucide-react';

interface WalletFreezeConfirmLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: 'primary' | 'negative';
  isConfirmDisabled?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
}

export function WalletFreezeConfirmLayout({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'negative',
  isConfirmDisabled = false,
  isLoading = false,
  onConfirm,
}: Readonly<WalletFreezeConfirmLayoutProps>) {
  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      className="w-[min(100%,32rem)] max-w-[calc(100vw-2rem)] p-2"
    >
      <Popup.Header onClose={onClose}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mds-casablanca-100">
          <AlertCircle
            className="h-8 w-8 text-mds-casablanca-500"
            aria-hidden
          />
        </div>
      </Popup.Header>

      <Popup.Content>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-mds-black-900">{title}</h2>
            <p className="text-base font-medium leading-[1.4] text-mds-black-800">
              {description}
            </p>
          </div>
          {children}
        </div>
      </Popup.Content>

      <Popup.Footer className="gap-5">
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={confirmVariant}
          size="md"
          className="flex-1"
          loading={isLoading}
          disabled={isLoading || isConfirmDisabled}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </Popup.Footer>
    </Popup>
  );
}
