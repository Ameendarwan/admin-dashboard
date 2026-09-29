'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Send } from 'lucide-react';

import {
  SELLER_STATUS_LABELS,
  SellerStatus,
  SellersTableMenuAction,
  TenantJourney,
} from '@/lib/enums';
import { buildOnboardedSellerTableStatusLabels } from '@/utils/sellerTableStatusLabels';
import { getSellerStatusColor } from '@/utils/sellerStatusUtils';
import type { SellerJourney } from '@/services/sellerService';
import { BaseTable, ColumnSettingsButton, SortButton } from '@/components';
import type { Pagination } from '@/types/pagination';
import type { MappedSellerInvite } from '@/types/invite';
import { useLocalization } from '@/hooks/useLocalization';
import { useColumnVisibility, useTableSort } from '@/hooks';

interface SellersTableProps {
  journey?: SellerJourney;
  sellerProfiles: MappedSellerInvite[];
  onSellerSelect: (seller: MappedSellerInvite) => void;
  onPageChange: (page: number) => void;
  pagination: Pagination;
  loadingRowId?: string | null;
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: SellerStatus | '') => void;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (order: 'asc' | 'desc' | null) => void;
  loading?: boolean;
  onResendInvite?: (seller: MappedSellerInvite) => void;
}

const COLUMN_KEYS = {
  FULL_NAME: 'fullName',
  EMAIL: 'email',
  BUSINESS_NAME: 'businessName',
  STATE: 'state',
} as const;

const TRANSLATION_KEYS = {
  TABLE_FULL_NAME: 'table.fullName',
  TABLE_EMAIL: 'table.email',
  TABLE_BUSINESS_NAME: 'table.businessName',
  TABLE_STATUS: 'table.status',
  TABLE_VIEW_DETAILS: 'table.viewDetails',
  TABLE_RESEND_INVITE: 'table.resendInvite',
  STATUS: 'status',
  SELECT_STATUS: 'selectStatus',
} as const;

export function SellersTable({
  journey,
  sellerProfiles,
  onSellerSelect,
  onPageChange,
  pagination,
  loadingRowId,
  onSearchChange,
  onStatusFilterChange,
  sortOrder: externalSortOrder = 'desc',
  onSortChange,
  loading,
  onResendInvite,
}: Readonly<SellersTableProps>) {
  const { translate } = useLocalization('sellers-dashboard');

  const { visibleColumns, toggleColumnVisibility } = useColumnVisibility({
    [COLUMN_KEYS.FULL_NAME]: true,
    [COLUMN_KEYS.EMAIL]: true,
    [COLUMN_KEYS.BUSINESS_NAME]: true,
    [COLUMN_KEYS.STATE]: true,
  });
  const { handleSortToggle } = useTableSort(externalSortOrder, onSortChange);

  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<SellerStatus | ''>('');

  useEffect(() => {
    if (journey === TenantJourney.ONBOARDED) {
      setStatusFilter('');
    }
  }, [journey]);

  const sortOrder = externalSortOrder;

  const onboardedTenantStatusLabels = useMemo(
    () => buildOnboardedSellerTableStatusLabels(translate),
    [translate],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: translate(TRANSLATION_KEYS.STATUS) },
      ...Object.entries(SELLER_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    ],
    [translate],
  );

  const statusLabelsForTable = useMemo(() => {
    if (journey === TenantJourney.ONBOARDED) {
      return onboardedTenantStatusLabels;
    }
    return SELLER_STATUS_LABELS;
  }, [journey, onboardedTenantStatusLabels]);

  const columnOptions = useMemo(
    () => [
      {
        key: COLUMN_KEYS.FULL_NAME,
        label: translate(TRANSLATION_KEYS.TABLE_FULL_NAME),
      },
      {
        key: COLUMN_KEYS.EMAIL,
        label: translate(TRANSLATION_KEYS.TABLE_EMAIL),
      },
      {
        key: COLUMN_KEYS.BUSINESS_NAME,
        label: translate(TRANSLATION_KEYS.TABLE_BUSINESS_NAME),
      },
      {
        key: COLUMN_KEYS.STATE,
        label: translate(TRANSLATION_KEYS.TABLE_STATUS),
      },
    ],
    [translate],
  );

  const isInviteSent = useCallback(
    (seller: MappedSellerInvite) => seller.state === SellerStatus.INVITE_SENT,
    [],
  );

  const filtersConfig = useMemo(() => {
    const items: Array<{
      key: string;
      label: string;
      type: 'dropdown';
      options?: Array<{ value: string; label: string }>;
      value?: string;
      placeholder?: string;
      component?: React.ReactNode;
    }> = [];

    if (journey !== TenantJourney.ONBOARDED) {
      items.push({
        key: TRANSLATION_KEYS.STATUS,
        label: translate(TRANSLATION_KEYS.STATUS),
        type: 'dropdown' as const,
        options: statusOptions,
        value: statusFilter,
        placeholder: translate(TRANSLATION_KEYS.SELECT_STATUS),
      });
    }

    items.push(
      {
        key: 'sorting',
        label: '',
        type: 'dropdown' as const,
        component: (
          <SortButton
            sortOrder={sortOrder}
            onSortToggle={handleSortToggle}
            ariaLabel="Sorting"
          />
        ),
      },
      {
        key: 'settings',
        label: '',
        type: 'dropdown' as const,
        component: (
          <ColumnSettingsButton
            columnOptions={columnOptions}
            visibleColumns={visibleColumns}
            toggleColumnVisibility={toggleColumnVisibility}
          />
        ),
      },
    );

    return items;
  }, [
    journey,
    translate,
    statusOptions,
    statusFilter,
    sortOrder,
    handleSortToggle,
    columnOptions,
    visibleColumns,
    toggleColumnVisibility,
  ]);

  const getRowMenuOptions = useCallback(
    (seller: MappedSellerInvite) => {
      if (journey === TenantJourney.ONBOARDED) {
        return [
          {
            value: SellersTableMenuAction.VIEW_DETAILS,
            label: translate(TRANSLATION_KEYS.TABLE_VIEW_DETAILS),
            icon: <Eye className="w-4 h-4" />,
            disabled: false,
          },
        ];
      }

      const inviteSent = isInviteSent(seller);
      return [
        {
          value: SellersTableMenuAction.RESEND_INVITE,
          label: translate(TRANSLATION_KEYS.TABLE_RESEND_INVITE),
          icon: <Send className="w-4 h-4" />,
          disabled: !inviteSent,
        },
      ];
    },
    [translate, isInviteSent, journey],
  );

  const handleRowMenuSelect = (
    optionValue: string,
    seller: MappedSellerInvite,
  ) => {
    if (journey === TenantJourney.ONBOARDED) {
      if (optionValue === SellersTableMenuAction.VIEW_DETAILS) {
        onSellerSelect(seller);
      }
      return;
    }

    if (
      optionValue === SellersTableMenuAction.RESEND_INVITE &&
      isInviteSent(seller) &&
      onResendInvite
    ) {
      onResendInvite(seller);
    }
  };

  const getStatusColor = useCallback(
    (status: string) => getSellerStatusColor(status, journey),
    [journey],
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  const handleStatusFilterChange = (filterKey: string, value: string) => {
    if (filterKey === TRANSLATION_KEYS.STATUS) {
      const newStatus = value as SellerStatus | '';
      setStatusFilter(newStatus);
      onStatusFilterChange?.(newStatus);
    }
  };

  return (
    <BaseTable
      data={sellerProfiles}
      onRowSelect={onSellerSelect}
      onPageChange={onPageChange}
      pagination={pagination}
      loadingRowId={loadingRowId}
      rowMenuOptions={getRowMenuOptions}
      onRowMenuSelect={handleRowMenuSelect}
      translationNamespace="sellers-dashboard"
      showCheckboxes={true}
      statusLabels={statusLabelsForTable}
      getStatusColor={getStatusColor}
      showSearch={true}
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      filtersConfig={filtersConfig}
      onFilterChange={handleStatusFilterChange}
      visibleColumns={visibleColumns}
      loading={loading}
      isRowDisabled={isInviteSent}
    />
  );
}
