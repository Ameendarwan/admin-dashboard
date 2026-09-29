'use client';

import { useCallback, useState } from 'react';

interface UseCatalogListSearchTableProps {
  onSearchChange?: (value: string) => void;
}

/** Table built-in search wiring (mirrors access-management / gift cards). */
export function useCatalogListSearchTable({
  onSearchChange,
}: UseCatalogListSearchTableProps = {}) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      onSearchChange?.(value);
    },
    [onSearchChange],
  );

  return {
    searchValue,
    handleSearchChange,
  };
}
