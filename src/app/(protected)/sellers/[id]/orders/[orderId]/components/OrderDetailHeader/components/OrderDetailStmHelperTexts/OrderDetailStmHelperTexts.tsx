'use client';

import type { Direction } from '@/hooks/useLocalization';

interface OrderDetailStmHelperTextsProps {
  pending: string | null;
  complete: string | null;
  dir: Direction;
}

export function OrderDetailStmHelperTexts({
  pending,
  complete,
  dir,
}: Readonly<OrderDetailStmHelperTextsProps>) {
  return (
    <>
      {pending ? (
        <p
          dir={dir}
          className="ms-auto w-full max-w-md text-end text-pretty text-xs leading-relaxed text-mds-black-500"
        >
          {pending}
        </p>
      ) : null}
      {complete ? (
        <p
          dir={dir}
          className="ms-auto w-full max-w-md text-end text-pretty text-xs leading-relaxed text-mds-black-500"
        >
          {complete}
        </p>
      ) : null}
    </>
  );
}
