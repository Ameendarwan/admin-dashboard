/* eslint-disable import/order */

'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';

import { LinkButton } from '@merit-incentives/ui';
import React from 'react';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/hooks/useLocalization';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  id?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function BackButton({
  id,
  className,
  onClick,
}: Readonly<BackButtonProps>) {
  const router = useRouter();
  const { isRTL, translate } = useLocalization('common');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (onClick) onClick(event);
    else router.back();
  };

  const icon = isRTL ? (
    <ArrowRight size={32} id={`${id}-arrow-right-icon`} />
  ) : (
    <ArrowLeft size={32} id={`${id}-arrow-left-icon`} />
  );

  return (
    <LinkButton
      onClick={handleClick}
      leftIcon={icon}
      size="lg"
      variant="tertiary"
      className={cn(
        'text-mds-black-600 hover:text-mds-black-900! gap-2 rounded-sm max-w-max p-2 pl-1',
        className,
      )}
      id={id}
    >
      <span className="text-base font-semibold" id={`${id}-back-text`}>
        {translate('back')}
      </span>
    </LinkButton>
  );
}
