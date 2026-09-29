import { useMemo, useState } from 'react';

import { REVIEW_STATUS_LABELS, TenantJourney } from '@/lib/enums';
import {
  ACCOUNT_MANAGERS,
  TENANT_MANAGEMENT_PRODUCT_LABELS,
  TENANT_MANAGEMENT_PRODUCTS,
  TENANT_ONBOARDED_TAB_REVIEW_STATUSES,
} from '@/constants/tenant';
import type { TenantTableStatusSource } from '@/utils/tenantTableStatusBadge';

interface UseTenantsTableFiltersProps {
  journey?: TenantJourney;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  productsFilter: string;
  onProductsFilterChange: (value: string) => void;
  countryFilter: string;
  onCountryFilterChange: (value: string) => void;
  accountManagerFilter: string;
  onAccountManagerFilterChange: (value: string) => void;
  translate: (key: string) => string;
  statusSource?: TenantTableStatusSource;
}

export function useTenantsTableFilters({
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
  statusSource = 'customerProfileState',
}: UseTenantsTableFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = useMemo(() => {
    if (statusSource === 'identityStatus') {
      return [
        { value: '', label: translate('table.status') },
        {
          value: 'active',
          label: translate('tenantIdentityStatus.active'),
        },
        {
          value: 'inactive',
          label: translate('tenantIdentityStatus.inactive'),
        },
      ];
    }

    const allOptions = [
      { value: '', label: translate('status') },
      ...Object.entries(REVIEW_STATUS_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    ];
    if (!journey) return allOptions;
    if (journey === TenantJourney.INVITED) {
      return [];
    }
    return [
      { value: '', label: translate('table.status') },
      ...TENANT_ONBOARDED_TAB_REVIEW_STATUSES.map((value) => ({
        value,
        label: REVIEW_STATUS_LABELS[value],
      })),
    ];
  }, [translate, journey, statusSource]);

  const productsOptions = useMemo(() => {
    return [
      { value: '', label: translate('table.activeProducts') },
      ...TENANT_MANAGEMENT_PRODUCTS.map((slug) => ({
        value: slug,
        label: TENANT_MANAGEMENT_PRODUCT_LABELS[slug],
      })),
    ];
  }, [translate]);

  const accountManagerOptions = useMemo(
    () => [
      { value: '', label: translate('table.accountManager') },
      ...ACCOUNT_MANAGERS.map((manager) => ({
        value: manager,
        label: manager,
      })),
    ],
    [translate],
  );

  const handleClearFilters = () => {
    onCountryFilterChange('');
    onProductsFilterChange('');
    onStatusFilterChange('');
    onAccountManagerFilterChange('');
  };

  const hasActiveFilters = !!(
    countryFilter ||
    productsFilter ||
    statusFilter ||
    accountManagerFilter
  );

  return {
    showFilters,
    setShowFilters,
    statusOptions,
    productsOptions,
    accountManagerOptions,
    handleClearFilters,
    hasActiveFilters,
  };
}
