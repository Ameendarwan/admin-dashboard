/* eslint-disable import/order */

import { BackButton } from '../BackButton';
import React from 'react';

interface DetailsPageHeaderProps {
  title: string;
  titleSuffix?: React.ReactNode;
  children?: React.ReactNode;
  appearance?: 'default' | 'onDark';
  onBackClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export function DetailsPageHeader({
  title,
  titleSuffix,
  children,
  appearance = 'default',
  onBackClick,
}: Readonly<DetailsPageHeaderProps>) {
  return (
    <>
      <BackButton onClick={onBackClick} />
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <h1
            className={
              appearance === 'onDark'
                ? 'text-2xl sm:text-[34px] font-semibold text-white'
                : 'text-2xl sm:text-[34px] font-semibold text-mds-black-900'
            }
          >
            {title}
          </h1>
          {titleSuffix}
        </div>

        {children && (
          <div className="flex w-full flex-wrap items-center gap-3 sm:ms-auto sm:w-auto">
            {children}
          </div>
        )}
      </div>
    </>
  );
}
