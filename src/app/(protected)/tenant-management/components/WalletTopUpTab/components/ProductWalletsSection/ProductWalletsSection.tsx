'use client';

import { ContentCard, InputDropdown } from '@merit-incentives/ui';

import { useProductWalletsSection } from '../../hooks';
import type { ProductWalletGroupModel } from '../../utils/walletTopUpTypes';
import { TenantWalletCard } from '../TenantWalletCard';
import { WalletFreezeActionLink } from '../WalletFreezeActionLink';

interface ProductWalletsSectionProps {
  productWallets: ProductWalletGroupModel[];
  getProductFreezeState?: (productCode: string) => {
    isFrozen: boolean;
    canFreeze: boolean;
    canUnfreeze: boolean;
  };
  onFreezeProduct?: (productCode: string) => void;
  onUnfreezeProduct?: (productCode: string) => void;
}

export function ProductWalletsSection({
  productWallets,
  getProductFreezeState,
  onFreezeProduct,
  onUnfreezeProduct,
}: Readonly<ProductWalletsSectionProps>) {
  const {
    translate,
    selectedProduct,
    setSelectedProduct,
    productOptions,
    activeWallets,
  } = useProductWalletsSection({ productWallets });

  if (productWallets.length === 0) {
    return (
      <ContentCard className="rounded-[14px] border border-mds-black-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-medium text-mds-black-900">
            {translate('productWallets.title')}
          </h2>
          <p className="text-sm text-mds-black-600">
            {translate('productWallets.empty')}
          </p>
        </div>
      </ContentCard>
    );
  }

  const freezeState = getProductFreezeState?.(selectedProduct) ?? {
    isFrozen: false,
    canFreeze: false,
    canUnfreeze: false,
  };

  return (
    <ContentCard className="overflow-visible rounded-[14px] border border-mds-black-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-medium text-mds-black-900">
            {translate('productWallets.title')}
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-4">
            {freezeState.isFrozen &&
            freezeState.canUnfreeze &&
            onUnfreezeProduct ? (
              <WalletFreezeActionLink
                action="unfreeze"
                label={translate('freezeActions.unfreezeProduct')}
                onClick={() => onUnfreezeProduct(selectedProduct)}
              />
            ) : null}
            {!freezeState.isFrozen &&
            freezeState.canFreeze &&
            onFreezeProduct ? (
              <WalletFreezeActionLink
                action="freeze"
                label={translate('freezeActions.freezeProduct')}
                onClick={() => onFreezeProduct(selectedProduct)}
              />
            ) : null}
            <div
              className="relative w-full overflow-visible sm:w-56"
              style={{ zIndex: 10 }}
            >
              <InputDropdown
                options={productOptions}
                value={selectedProduct}
                onChange={(value) => setSelectedProduct(value)}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {activeWallets.map((wallet) => (
            <TenantWalletCard
              key={`${selectedProduct}-${wallet.id}`}
              wallet={wallet}
            />
          ))}
        </div>
      </div>
    </ContentCard>
  );
}
