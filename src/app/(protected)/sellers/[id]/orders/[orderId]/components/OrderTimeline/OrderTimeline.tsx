'use client';

import { Clock, Check, Circle } from 'lucide-react';
import { ContentCard } from '@merit-incentives/ui';

import { useLocalization } from '@/hooks/useLocalization';
import { formatDateTimeInTimeZone, SAUDI_TZ_LABEL } from '@/utils/dateHelpers';

interface TimelineItem {
  label: React.ReactNode;
  date: string;
  completed: boolean;
}

interface OrderTimelineProps {
  timelineItems: TimelineItem[];
}

export function OrderTimeline({ timelineItems }: Readonly<OrderTimelineProps>) {
  const { translate } = useLocalization('order-details');

  return (
    <ContentCard className="p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Clock className="h-6 w-6 text-mds-gray-700" />
        <h2 className="text-xl font-normal text-mds-gray-900">
          {translate('orderTimeline')}
        </h2>
      </div>
      <div className="flex flex-col">
        {timelineItems.map((item, index) => {
          const isLast = index === timelineItems.length - 1;
          const showConnector = timelineItems.length > 1 && !isLast;

          return (
            <div
              key={`${index}-${item.date}`}
              className="grid grid-cols-[32px_1fr] gap-4"
            >
              <div className="flex h-full flex-col items-center">
                {item.completed ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mds-primary-600">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-mds-gray-300 bg-white">
                    <Circle className="h-3 w-3 fill-mds-gray-300 text-mds-gray-300" />
                  </div>
                )}

                {showConnector ? (
                  <div className="-mt-px h-10 w-0.5 bg-mds-gray-300" />
                ) : null}
              </div>

              <div className="pt-0.5">
                <p
                  className={`text-lg font-medium ${
                    item.completed ? 'text-mds-gray-900' : 'text-mds-gray-700'
                  }`}
                >
                  {item.label}
                </p>
                <p
                  className={`text-sm ${
                    item.completed ? 'text-mds-gray-500' : 'text-mds-gray-400'
                  }`}
                >
                  {formatDateTimeInTimeZone(item.date)}
                  {item.date && item.date !== '-' ? (
                    <>
                      {' '}
                      <span className="text-xs text-mds-gray-500">
                        {SAUDI_TZ_LABEL}
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ContentCard>
  );
}
