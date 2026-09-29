'use client';

import { cn } from '@merit-incentives/ui';
import type { CSSProperties } from 'react';

import { getFormStepCircleContent } from '@/components/FormStepCircleContent';

interface ListingFormStepperProps {
  steps: readonly string[];
  currentIndex: number;
}

const CIRCLE_PX = 40;
const HALF = CIRCLE_PX / 2;

/** Place step column so the circle center lies on the baseline from first to last circle. */
function stepPositionStyle(index: number, total: number): CSSProperties {
  if (total <= 1) {
    return { left: '50%', transform: 'translateX(-50%)' };
  }
  const t = index / (total - 1);
  return {
    left: `calc(${HALF}px + (100% - ${CIRCLE_PX}px) * ${t})`,
    transform: 'translateX(-50%)',
  };
}

export function ListingFormStepper({
  steps,
  currentIndex,
}: Readonly<ListingFormStepperProps>) {
  const n = steps.length;
  const segmentCount = Math.max(n - 1, 1);
  const progressRatio =
    n <= 1 ? 0 : Math.min(1, Math.max(0, currentIndex / segmentCount));

  return (
    <div className="relative w-full pb-20 sm:pb-24">
      {/* Baseline only between first and last circle centers (no tail past last step) */}
      <div
        className="pointer-events-none absolute z-0 bg-mds-black-200"
        style={{
          left: `${HALF}px`,
          width: `calc(100% - ${CIRCLE_PX}px)`,
          top: `${HALF}px`,
          height: 1,
        }}
        aria-hidden
      />
      {n > 1 ? (
        <div
          className="pointer-events-none absolute z-0 bg-mds-primary-600"
          style={{
            left: `${HALF}px`,
            top: `${HALF}px`,
            height: 1,
            width: `calc((100% - ${CIRCLE_PX}px) * ${progressRatio})`,
          }}
          aria-hidden
        />
      ) : null}

      {steps.map((label, i) => {
        const isComplete = i < currentIndex;
        const isActive = i === currentIndex;

        const circleContent = getFormStepCircleContent(isComplete, isActive);

        return (
          <div
            key={label}
            className="pointer-events-none absolute top-0 flex flex-col items-center"
            style={stepPositionStyle(i, n)}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                isComplete &&
                  'border-0 bg-mds-primary-600 text-white shadow-none',
                isActive &&
                  !isComplete &&
                  'border-2 border-mds-primary-600 bg-white shadow-sm',
                !isActive &&
                  !isComplete &&
                  'border border-mds-black-200 bg-white',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              {circleContent}
            </div>
            <p
              className={cn(
                'mt-3 px-1 text-center text-xs font-medium leading-snug sm:text-[13px]',
                i === n - 1
                  ? 'whitespace-nowrap'
                  : 'max-w-[10rem] sm:max-w-[11rem]',
                isActive || isComplete
                  ? 'text-mds-primary-600'
                  : 'text-mds-black-500',
              )}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
