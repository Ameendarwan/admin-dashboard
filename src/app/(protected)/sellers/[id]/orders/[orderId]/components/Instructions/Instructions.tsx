'use client';

import { FileText } from 'lucide-react';
import { ContentCard } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';

interface InstructionsProps {
  instructions: string | null;
}

export function Instructions({ instructions }: Readonly<InstructionsProps>) {
  const { translate } = useLocalization('order-details');

  return (
    <ContentCard className="p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <FileText className="h-6 w-6 text-mds-gray-700" />
        <h2 className="text-xl font-normal text-mds-gray-900">
          {translate('specialInstructions')}
        </h2>
      </div>
      {instructions ? (
        <p className="text-base text-mds-gray-900">{instructions}</p>
      ) : (
        <p className="text-base italic text-mds-gray-500">
          {translate('noSpecialInstructions')}
        </p>
      )}
    </ContentCard>
  );
}
