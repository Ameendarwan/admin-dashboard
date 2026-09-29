'use client';

import type { ReactNode } from 'react';

export function OrderDetailPageFrame({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen pb-10 pt-2 md:pb-12 md:pt-4">
      <div className="mx-auto w-full max-w-400 px-4 md:px-8">{children}</div>
    </div>
  );
}
