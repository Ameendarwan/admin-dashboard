import type * as React from 'react';
import { LoadingSpinner } from '@merit-incentives/ui/components';

import { cn } from '@/lib/utils';

type SpinnerSize = React.ComponentProps<typeof LoadingSpinner>['size'];

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the spinner
   * @default "lg"
   */
  size?: SpinnerSize;
  /**
   * Optional text to display below the spinner
   */
  text?: string;
  /**
   * Whether the spinner should take the full height of its parent
   * @default false
   */
  fullHeight?: boolean;
}

export function Spinner({
  size = 'lg',
  text,
  fullHeight = false,
  className,
  ...props
}: Readonly<SpinnerProps>) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullHeight && 'h-full',
        className,
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <LoadingSpinner size={size} />
      {text && <div className="mt-3 text-sm text-muted-foreground">{text}</div>}
      <span className="sr-only">Loading</span>
    </div>
  );
}
