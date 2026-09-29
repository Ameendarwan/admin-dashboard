'use client';

import { useEffect, useState } from 'react';

import useDebounce from '@/hooks/useDebounce';

const SEARCH_DEBOUNCE_MS = 350;

export function useDebouncedCatalogUrlSearch(
  urlValue: string,
  onCommit: (next: string | undefined) => void,
) {
  const [input, setInput] = useState(urlValue);
  const debounced = useDebounce(input.trim(), SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setInput(urlValue);
  }, [urlValue]);

  useEffect(() => {
    if (debounced === urlValue) {
      return;
    }
    onCommit(debounced || undefined);
  }, [debounced, onCommit, urlValue]);

  return [input, setInput] as const;
}
