'use client';

import { Button, Popup } from '@merit-incentives/ui/components';
import React from 'react';
import { CircleCheck, AlertCircle } from 'lucide-react';

interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'warning' | 'error' | 'delete';
  title: string;
  description: string | React.ReactNode;
  primaryButton?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'negative';
  };
  secondaryButton?: {
    text: string;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'negative';
  };
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  /** When false, popup stays open after primary click (e.g. async delete). Default true. */
  closeOnPrimaryAction?: boolean;
  /** Shows spinner on primary button while an async action runs. */
  primaryLoading?: boolean;
}

export function ConfirmationPopup({
  isOpen,
  onClose,
  type,
  title,
  description,
  primaryButton = { text: 'Confirm', variant: 'primary' },
  secondaryButton,
  onPrimaryAction,
  onSecondaryAction,
  closeOnPrimaryAction = true,
  primaryLoading = false,
}: Readonly<ConfirmationPopupProps>) {
  const popupConfigs = {
    success: {
      icon: CircleCheck,
      iconBg: 'bg-mds-success-100',
      iconColor: 'text-mds-success-500',
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-mds-casablanca-100',
      iconColor: 'text-mds-casablanca-500',
    },
    error: {
      icon: CircleCheck,
      iconBg: 'bg-mds-error-100',
      iconColor: 'text-mds-error-500',
    },
    delete: {
      icon: CircleCheck,
      iconBg: 'bg-mds-error-100',
      iconColor: 'text-mds-error-500',
    },
  };

  const config = popupConfigs[type];
  const IconComponent = config.icon;

  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    }
    if (closeOnPrimaryAction) {
      onClose();
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    }
    onClose();
  };

  return (
    <div className="m-0">
      <Popup isOpen={isOpen} onClose={onClose} className="w-120 p-2">
        <Popup.Header onClose={onClose}>
          <div className="flex items-start gap-mds-md">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${config.iconBg}`}
            >
              <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
            </div>
          </div>
        </Popup.Header>
        <Popup.Content>
          <div className="space-y-mds-md">
            <h2 className="text-2xl font-medium text-mds-black-900">{title}</h2>
            <p className="text-base font-medium text-mds-black-800 leading-[140%] whitespace-pre-line">
              {description}
            </p>
          </div>
        </Popup.Content>
        <Popup.Footer className="gap-mds-sm">
          {secondaryButton && (
            <Button
              variant={secondaryButton.variant}
              size="md"
              className="flex-1"
              onClick={handleSecondaryAction}
              disabled={primaryLoading}
            >
              {secondaryButton.text}
            </Button>
          )}
          <Button
            variant={primaryButton.variant}
            size="md"
            className="flex-1"
            loading={primaryLoading}
            disabled={primaryLoading}
            onClick={handlePrimaryAction}
          >
            {primaryButton.text}
          </Button>
        </Popup.Footer>
      </Popup>
    </div>
  );
}
