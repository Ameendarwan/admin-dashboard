'use client';

import { cn } from '@merit-incentives/ui';

import { getFormStepCircleContent } from '@/components/FormStepCircleContent';

type CreateStorefrontStepperProps = Readonly<{
  steps: readonly string[];
  currentIndex: number;
  stepNumberLabel: (index: number) => string;
}>;

const CIRCLE_PX = 40;
const CIRCLE_HALF = CIRCLE_PX / 2;

function stepColumnClass(index: number, total: number): string {
  if (index === 0) {
    return 'items-start text-left';
  }
  if (index === total - 1) {
    return 'items-end text-right';
  }
  return 'items-center text-center';
}

export function CreateStorefrontStepper({
  steps,
  currentIndex,
  stepNumberLabel,
}: CreateStorefrontStepperProps) {
  const n = steps.length;
  const segmentCount = Math.max(n - 1, 1);
  const progressRatio =
    n <= 1 ? 0 : Math.min(1, Math.max(0, currentIndex / segmentCount));

  return (
    <div className="relative w-full min-h-[5.75rem] py-1 sm:min-h-[6.5rem]">
      <div
        className="pointer-events-none absolute z-0 bg-mds-black-200"
        style={{
          left: `${CIRCLE_HALF}px`,
          right: `${CIRCLE_HALF}px`,
          top: `${CIRCLE_HALF}px`,
          height: 1,
        }}
        aria-hidden
      />
      {n > 1 && currentIndex > 0 ? (
        <div
          className="pointer-events-none absolute z-0 bg-mds-primary-600"
          style={{
            left: `${CIRCLE_HALF}px`,
            top: `${CIRCLE_HALF}px`,
            height: 1,
            width: `calc((100% - ${CIRCLE_PX}px) * ${progressRatio})`,
          }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 grid w-full grid-cols-3 items-start gap-x-1 sm:gap-x-3 md:gap-x-6">
        {steps.map((title, i) => {
          const isComplete = i < currentIndex;
          const isActive = i === currentIndex;
          const isFirst = i === 0;
          const isLast = i === n - 1;

          const circleContent = getFormStepCircleContent(isComplete, isActive);

          return (
            <div
              key={title}
              className={cn('flex min-w-0 flex-col', stepColumnClass(i, n))}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-colors',
                  isComplete && 'border-0 bg-mds-primary-600 text-white',
                  isActive &&
                    !isComplete &&
                    'border-2 border-mds-primary-600 shadow-none',
                  !isActive && !isComplete && 'border border-mds-black-200',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                {circleContent}
              </div>
              <p
                className={cn(
                  'mt-2 text-xs font-normal leading-4 text-mds-black-500 sm:mt-3 sm:text-sm sm:leading-5',
                  isFirst && 'pe-1 sm:pe-2',
                  isLast && 'ps-1 sm:ps-2',
                )}
              >
                {stepNumberLabel(i + 1)}
              </p>
              <p
                className={cn(
                  'mt-1 text-sm font-medium leading-snug break-words text-mds-black-900 sm:mt-1.5 sm:text-base sm:leading-6 md:text-lg',
                  isFirst && 'pe-1 sm:pe-2',
                  isLast && 'ps-1 sm:ps-2',
                )}
              >
                {title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
