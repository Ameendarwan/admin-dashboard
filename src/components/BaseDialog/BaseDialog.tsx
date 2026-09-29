'use client';

import React, { ReactElement, ReactNode, SVGProps } from 'react';
import { Popup, Button, type ButtonVariant } from '@merit-incentives/ui';

interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  title: string;
  description?: string;
  submitButtonText: string;
  submitButtonIcon?: ReactElement<SVGProps<SVGSVGElement>>;
  submitButtonVariant?: ButtonVariant;
  submitDisabled?: boolean;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
  className?: string;
  fullWidthFooterActions?: boolean;
}

export function BaseDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  title,
  description,
  submitButtonText,
  submitButtonIcon,
  submitButtonVariant = 'primary',
  submitDisabled = false,
  secondaryButtonText,
  onSecondaryAction,
  children,
  closeOnOutsideClick = true,
  className,
  fullWidthFooterActions = false,
}: Readonly<BaseDialogProps>) {
  const actionButtonClassName = fullWidthFooterActions ? 'flex-1' : 'w-auto';

  return (
    <Popup
      isOpen={isOpen}
      onClose={closeOnOutsideClick ? onClose : () => {}}
      size="lg"
      className={
        className ?? 'w-full max-w-162.5 scrollbar-hide overflow-visible'
      }
    >
      <Popup.Header
        onClose={onClose}
        showDivider
        className="px-mds-2xl items-start"
      >
        <div className="flex flex-col gap-mds-md">
          <h1 className="text-2xl font-bold text-mds-black-900">{title}</h1>
          {!!description && (
            <p className="text-base font-medium text-mds-black-600 leading-[140%]">
              {description}
            </p>
          )}
        </div>
      </Popup.Header>

      <Popup.Content showDivider className="p-mds-2xl! scrollbar-hide">
        <form onSubmit={onSubmit} className="space-y-mds-2xl">
          <div className="space-y-mds-lg w-full">{children}</div>
        </form>
      </Popup.Content>

      <Popup.Footer className="py-mds-xl px-mds-2xl">
        <div className="flex justify-between gap-mds-lg w-full">
          {secondaryButtonText && onSecondaryAction && (
            <Button
              variant="secondary"
              size="md"
              onClick={onSecondaryAction}
              disabled={isLoading}
              className={actionButtonClassName}
            >
              {secondaryButtonText}
            </Button>
          )}
          <Button
            variant={submitButtonVariant}
            size="md"
            onClick={onSubmit}
            loading={isLoading}
            disabled={isLoading || submitDisabled}
            className={actionButtonClassName}
            leftIcon={submitButtonIcon}
          >
            {submitButtonText}
          </Button>
        </div>
      </Popup.Footer>
    </Popup>
  );
}
