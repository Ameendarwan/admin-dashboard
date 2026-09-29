'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { MouseEvent } from 'react';

import { readCatalogReturnToParam } from '@/app/(protected)/catalog-management/utils/catalogListingsRoute';

export function useCatalogDetailBack(fallbackReturnTo: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = useMemo(
    () => readCatalogReturnToParam(searchParams) ?? fallbackReturnTo,
    [fallbackReturnTo, searchParams],
  );

  const handleBack = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      router.push(returnTo);
    },
    [returnTo, router],
  );

  return { returnTo, handleBack };
}
