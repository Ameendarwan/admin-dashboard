import { JSX, useCallback, useState } from 'react';

/**
 * Shared hook for common table features
 */
export function useTableRowSelection() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const handleRowSelect = useCallback(
    (rowId: string | number, isSelected: boolean) => {
      const id = String(rowId);
      if (isSelected) {
        setSelectedRows((prev) => [...prev, id]);
      } else {
        setSelectedRows((prev) =>
          prev.filter((selectedId) => selectedId !== id),
        );
      }
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    // Implementation can be enhanced later
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  return {
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    clearSelection,
  };
}

/**
 * Hook for managing table column visibility
 */
export function useColumnVisibility(initialColumns: Record<string, boolean>) {
  const [visibleColumns, setVisibleColumns] = useState(initialColumns);

  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  }, []);

  const setColumnVisibility = useCallback(
    (columnKey: string, isVisible: boolean) => {
      setVisibleColumns((prev) => ({
        ...prev,
        [columnKey]: isVisible,
      }));
    },
    [],
  );

  return {
    visibleColumns,
    toggleColumnVisibility,
    setColumnVisibility,
  };
}

/**
 * Hook for table sorting
 */
export function useTableSort(
  initialOrder: 'asc' | 'desc' = 'desc',
  onSortChange?: (order: 'asc' | 'desc' | null) => void,
) {
  const handleSortToggle = useCallback(() => {
    const newOrder = initialOrder === 'desc' ? 'asc' : 'desc';
    onSortChange?.(newOrder);
  }, [initialOrder, onSortChange]);

  return {
    handleSortToggle,
  };
}

/**
 * Formats a date string for display (DD/MM/YYYY)
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Helper function to format date strings for table cells (ISO)
 */
export function formatTableDate(dateString: string): string {
  if (dateString === 'Never' || !dateString) return '-';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to render text cell
 */
export function renderTableTextCell(
  text: string,
  className = 'text-mds-gray-900',
): JSX.Element {
  return <div className={className}>{text}</div>;
}
