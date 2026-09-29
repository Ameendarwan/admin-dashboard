import React, { useCallback, useEffect, useMemo } from 'react';
import { Badge } from '@merit-incentives/ui';
import { Send } from 'lucide-react';

import {
  ReviewStatus,
  TenantJourney,
  TenantsTableMenuAction,
} from '@/lib/enums';
import type { TenantProfile } from '@/types/tenantManagement';
import { ColumnSettingsButton, FilterButton } from '@/components';
import { useTableRowSelection, useColumnVisibility } from '@/hooks';
import { getPlatformDisplayLabel } from '@/utils/platformUtils';
import {
  TENANT_TABLE_INVITED_TAB_ROW_CLASSNAME,
  TENANT_TABLE_ONBOARDING_PENDING_ROW_CLASSNAME,
} from '@/constants/tenant';
import { canResendTenantInvite } from '@/utils/tenantInviteStatusUtils';
import {
  buildOnboardedTenantRowMenuOptions,
  getInvitedTenantResendMenuFields,
} from '@/utils/tenantTableRowMenuUtils';
import { resolveTenantTableStatusBadge } from '@/utils/tenantTableStatusBadge';
import type { TenantTableStatusSource } from '@/utils/tenantTableStatusBadge';

import { useTenantsTableFilters } from './useTenantsTableFilters';

interface UseTenantsTableProps {
  journey?: TenantJourney;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  productsFilter: string;
  onProductsFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  accountManagerFilter: string;
  onAccountManagerFilterChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange?: (order: 'asc' | 'desc' | null) => void;
  translate: (key: string) => string;
  loadingRowId?: string | null;
  onTenantSelect: (tenant: TenantProfile) => void;
  onRequestReview: (tenant: TenantProfile) => void;
  onApprove: (tenant: TenantProfile) => void;
  onReject: (tenant: TenantProfile) => void;
  onResendInvite?: (tenant: TenantProfile) => void;
  /** Rewards portal: keep onboarding rows clickable with enabled menus. */
  allowOnboardingActions?: boolean;
  /** Rewards portal: Status column uses identity `status` (active/inactive). */
  statusSource?: TenantTableStatusSource;
}

export function useTenantsTable({
  journey,
  statusFilter,
  onStatusFilterChange,
  productsFilter,
  onProductsFilterChange,
  countryFilter,
  onCountryFilterChange,
  accountManagerFilter,
  onAccountManagerFilterChange,

  translate,
  loadingRowId,
  onTenantSelect,
  onRequestReview,
  onApprove,
  onReject,
  onResendInvite,
  allowOnboardingActions = false,
  statusSource = 'customerProfileState',
}: UseTenantsTableProps) {
  const { selectedRows, handleRowSelect, handleSelectAll } =
    useTableRowSelection();
  const { visibleColumns, toggleColumnVisibility } = useColumnVisibility({
    businessName: true,
    status: true,
    activeProducts: true,
    businessOwner: true,
    country: true,
    accountManager: true,
  });

  const {
    showFilters,
    setShowFilters,
    statusOptions,
    productsOptions,
    accountManagerOptions,
    handleClearFilters,
    hasActiveFilters,
  } = useTenantsTableFilters({
    journey,
    statusFilter,
    onStatusFilterChange,
    productsFilter,
    onProductsFilterChange,
    countryFilter,
    onCountryFilterChange,
    accountManagerFilter,
    onAccountManagerFilterChange,
    translate,
    statusSource,
  });

  useEffect(() => {
    if (journey === TenantJourney.INVITED) {
      setShowFilters(false);
    }
  }, [journey, setShowFilters]);

  const columnOptions = useMemo(
    () => [
      { key: 'businessName', label: translate('table.tenantBusiness') },
      { key: 'status', label: translate('table.status') },
      { key: 'activeProducts', label: translate('table.activeProducts') },
      { key: 'businessOwner', label: translate('table.businessOwner') },
      { key: 'country', label: translate('table.country') },
      { key: 'accountManager', label: translate('table.accountManager') },
    ],
    [translate],
  );

  const getRowMenuOptions = useCallback(
    (row: TenantProfile) => {
      if (journey === TenantJourney.INVITED) {
        const resendFields = getInvitedTenantResendMenuFields(row, translate);
        return [
          {
            ...resendFields,
            icon: <Send className="w-4 h-4" />,
          },
        ];
      }
      return buildOnboardedTenantRowMenuOptions(row, translate, {
        allowOnboardingActions,
      });
    },
    [allowOnboardingActions, journey, translate],
  );

  const getRowClassName = useCallback(
    (row: TenantProfile) => {
      if (journey === TenantJourney.INVITED) {
        return TENANT_TABLE_INVITED_TAB_ROW_CLASSNAME;
      }
      if (
        !allowOnboardingActions &&
        journey === TenantJourney.ONBOARDED &&
        row.customerProfileState === ReviewStatus.ONBOARDING
      ) {
        return TENANT_TABLE_ONBOARDING_PENDING_ROW_CLASSNAME;
      }
      return '';
    },
    [allowOnboardingActions, journey],
  );

  const isRowMenuDisabled = useCallback(
    (row: TenantProfile) => {
      if (allowOnboardingActions) return false;
      if (journey !== TenantJourney.ONBOARDED) return false;
      return row.customerProfileState === ReviewStatus.ONBOARDING;
    },
    [allowOnboardingActions, journey],
  );

  const handleTenantRowClick = useCallback(
    (row: TenantProfile) => {
      if (journey === TenantJourney.INVITED) {
        return;
      }
      if (
        !allowOnboardingActions &&
        journey === TenantJourney.ONBOARDED &&
        row.customerProfileState === ReviewStatus.ONBOARDING
      ) {
        return;
      }
      onTenantSelect(row);
    },
    [allowOnboardingActions, journey, onTenantSelect],
  );

  const handleRowMenuSelect = (optionValue: string, tenant: TenantProfile) => {
    switch (optionValue) {
      case TenantsTableMenuAction.VIEW_DETAILS:
        onTenantSelect(tenant);
        break;
      case TenantsTableMenuAction.RESEND_INVITE:
        if (canResendTenantInvite(tenant.status) && onResendInvite) {
          onResendInvite(tenant);
        }
        break;
      case TenantsTableMenuAction.REQUEST_REVISION:
        onRequestReview(tenant);
        break;
      case TenantsTableMenuAction.APPROVE:
        onApprove(tenant);
        break;
      case TenantsTableMenuAction.REJECT:
        onReject(tenant);
        break;
    }
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    if (filterKey === 'status') {
      onStatusFilterChange(value);
    }
  };

  const filtersConfig = useMemo(() => {
    const items: {
      key: string;
      label: string;
      type: 'dropdown';
      component: React.ReactNode;
    }[] = [];
    if (journey !== TenantJourney.INVITED) {
      items.push({
        key: 'filter',
        label: '',
        type: 'dropdown' as const,
        component: (
          <FilterButton
            isActive={showFilters || hasActiveFilters}
            onToggle={() => setShowFilters((prev) => !prev)}
          />
        ),
      });
    }
    items.push({
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
    });
    return items;
  }, [
    journey,
    showFilters,
    hasActiveFilters,
    columnOptions,
    visibleColumns,
    toggleColumnVisibility,
    setShowFilters,
  ]);

  const columns = useMemo(() => {
    const isInvitedTab = journey === TenantJourney.INVITED;

    const allColumns = [
      {
        key: 'businessName' as const,
        label: translate('table.tenantBusiness'),
        render: (row: TenantProfile) => (
          <div
            className={
              isInvitedTab
                ? 'text-mds-gray-400 font-medium'
                : 'text-mds-gray-900 font-medium'
            }
          >
            {row.businessName}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'status' as const,
        label: translate('table.status'),
        render: (row: TenantProfile) => {
          const isRowLoading = loadingRowId === row.id;
          const { color: statusBadgeColor, label: statusBadgeLabel } =
            resolveTenantTableStatusBadge(
              row,
              journey,
              translate,
              statusSource,
            );

          return (
            <div
              className={
                isInvitedTab
                  ? 'flex items-center justify-start opacity-80'
                  : 'flex items-center justify-start'
              }
            >
              {isRowLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-mds-primary-600"></div>
                  <span className="text-sm text-mds-gray-600">
                    {translate('updating')}
                  </span>
                </div>
              ) : (
                <Badge
                  className="whitespace-nowrap"
                  color={statusBadgeColor}
                  leftIcon
                  size="lg"
                >
                  {statusBadgeLabel}
                </Badge>
              )}
            </div>
          );
        },
        align: 'center' as const,
        showOnMobile: true,
      },
      {
        key: 'activeProducts' as const,
        label: translate('table.activeProducts'),
        render: (row: TenantProfile) => (
          <div
            className={
              isInvitedTab
                ? 'flex flex-wrap gap-1 opacity-80'
                : 'flex flex-wrap gap-1'
            }
          >
            {row.platforms && row.platforms.length > 0 ? (
              row.platforms.map((platform) => (
                <Badge key={platform.id} color="primary" size="lg">
                  {getPlatformDisplayLabel(platform)}
                </Badge>
              ))
            ) : (
              <span
                className={
                  isInvitedTab ? 'text-mds-gray-400' : 'text-mds-gray-600'
                }
              >
                -
              </span>
            )}
          </div>
        ),
        showOnMobile: false,
      },
      {
        key: 'businessOwner' as const,
        label: translate('table.businessOwner'),
        render: (row: TenantProfile) => (
          <div
            className={isInvitedTab ? 'text-mds-gray-400' : 'text-mds-gray-900'}
          >
            {row.email || row.metadata?.businessOwnerEmail || row.key}
          </div>
        ),
        showOnMobile: true,
      },
      {
        key: 'country' as const,
        label: translate('table.country'),
        render: (row: TenantProfile) => (
          <div
            className={isInvitedTab ? 'text-mds-gray-400' : 'text-mds-gray-600'}
          >
            {row.country || '-'}
          </div>
        ),
        showOnMobile: false,
      },
      {
        key: 'accountManager' as const,
        label: translate('table.accountManager'),
        render: (row: TenantProfile) => (
          <div
            className={isInvitedTab ? 'text-mds-gray-400' : 'text-mds-gray-600'}
          >
            {row.accountManager || '-'}
          </div>
        ),
        showOnMobile: false,
      },
    ];

    return allColumns.filter((col) => visibleColumns[col.key] !== false);
  }, [translate, visibleColumns, loadingRowId, journey, statusSource]);

  return {
    selectedRows,
    handleRowSelect,
    handleSelectAll,
    getRowMenuOptions,
    handleRowMenuSelect,
    getRowClassName,
    isRowMenuDisabled,
    handleTenantRowClick,
    columns,
    filtersConfig,
    handleFilterChange,
    showFilters,
    setShowFilters,
    statusOptions,
    productsOptions,
    accountManagerOptions,
    handleClearFilters,
    hasActiveFilters,
  };
}
