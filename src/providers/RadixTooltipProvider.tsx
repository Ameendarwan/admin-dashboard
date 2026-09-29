'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export function RadixTooltipProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <Tooltip.Provider delayDuration={0} skipDelayDuration={300}>
      {children}
    </Tooltip.Provider>
  );
}
