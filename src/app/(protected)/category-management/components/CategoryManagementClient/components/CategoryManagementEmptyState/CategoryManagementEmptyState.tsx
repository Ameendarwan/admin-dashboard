'use client';

import { CategoryManagementEmptyIllustration } from '../../../CategoryManagementEmptyIllustration';

interface CategoryManagementEmptyStateProps {
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function CategoryManagementEmptyState({
  translate,
}: Readonly<CategoryManagementEmptyStateProps>) {
  return (
    <div className="flex min-h-[min(56vh,420px)] flex-col items-center justify-center px-6 py-14 sm:px-8 sm:py-16">
      <CategoryManagementEmptyIllustration />

      <h2 className="mt-8 text-center text-lg font-semibold text-mds-black-900 sm:text-xl">
        {translate('categoryManagement.emptyTitle')}
      </h2>
      <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-mds-black-600 sm:text-[15px]">
        {translate('categoryManagement.emptyDescription')}
      </p>
    </div>
  );
}
