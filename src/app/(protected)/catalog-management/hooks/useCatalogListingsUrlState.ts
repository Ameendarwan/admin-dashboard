'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import { writeOrDeleteQueryParam } from '@/app/(protected)/catalog-management/utils/catalogUrlFilters';
import { readCatalogQueryParam } from '@/app/(protected)/catalog-management/utils/queryParams';

import {
  CATALOG_PRIMARY_TAB_LISTINGS,
  CATALOG_PRIMARY_TAB_OFFERS,
} from '../constants/catalogListingsConstants';
import {
  type CatalogListingsMainTab,
  type CatalogListingsSubTab,
  readCatalogListingsPage,
  stripLegacyCatalogPageParams,
  writeCatalogPage,
} from '../utils/catalogListingsRoute';

function hasLegacyCatalogPageParams(params: URLSearchParams): boolean {
  return params.has('listingsPage') || params.has('requestsPage');
}

export function useCatalogListingsUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const main = readCatalogQueryParam(
    searchParams,
    'main',
    [CATALOG_PRIMARY_TAB_LISTINGS, CATALOG_PRIMARY_TAB_OFFERS],
    CATALOG_PRIMARY_TAB_LISTINGS,
  ) as CatalogListingsMainTab;
  const sub = readCatalogQueryParam(
    searchParams,
    'sub',
    ['active', 'requests'],
    'active',
  ) as CatalogListingsSubTab;
  const page = readCatalogListingsPage(searchParams);

  const setQuery = useCallback(
    (next: {
      main?: CatalogListingsMainTab;
      sub?: CatalogListingsSubTab;
      page?: number;
      filters?: Record<string, string | undefined>;
    }) => {
      const p = new URLSearchParams(searchParams.toString());
      stripLegacyCatalogPageParams(p);

      const mainChanged = next.main !== undefined && next.main !== main;
      const subChanged = next.sub !== undefined && next.sub !== sub;
      const filtersChanged = next.filters !== undefined;

      if (next.main) {
        p.set('main', next.main);
      }
      if (next.sub) {
        p.set('sub', next.sub);
      }
      if (next.filters) {
        for (const [key, value] of Object.entries(next.filters)) {
          writeOrDeleteQueryParam(p, key, value);
        }
      }

      if (next.page !== undefined) {
        writeCatalogPage(p, next.page);
      } else if (mainChanged || subChanged || filtersChanged) {
        writeCatalogPage(p, 1);
      }

      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [main, pathname, router, searchParams, sub],
  );

  const setPage = useCallback(
    (next: number) => {
      setQuery({ page: next });
    },
    [setQuery],
  );

  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (!p.get('main')) {
      p.set('main', CATALOG_PRIMARY_TAB_LISTINGS);
      changed = true;
    }
    if (!p.get('sub')) {
      p.set('sub', 'active');
      changed = true;
    }
    if (hasLegacyCatalogPageParams(p)) {
      stripLegacyCatalogPageParams(p);
      changed = true;
    }

    const next = p.toString();
    if (changed && next !== searchParams.toString()) {
      router.replace(`${pathname}?${next}`, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (main === CATALOG_PRIMARY_TAB_OFFERS && sub === 'requests') {
      const p = new URLSearchParams(searchParams.toString());
      stripLegacyCatalogPageParams(p);
      p.set('sub', 'active');
      writeCatalogPage(p, 1);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [main, sub, pathname, router, searchParams]);

  return { main, sub, page, setPage, setQuery };
}
