'use client';

import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from '@/hooks';
import { getProductLabel } from '@/constants/platform';

import type { ProductWalletGroupModel } from '../utils/walletTopUpTypes';

interface UseProductWalletsSectionArgs {
  productWallets: ProductWalletGroupModel[];
}

export function useProductWalletsSection({
  productWallets,
}: Readonly<UseProductWalletsSectionArgs>) {
  const { translate } = useLocalization('tenant-details.walletTopUp');
  const [selectedProduct, setSelectedProduct] = useState(
    productWallets[0]?.productCode ?? '',
  );

  useEffect(() => {
    if (
      productWallets.length > 0 &&
      !productWallets.some((group) => group.productCode === selectedProduct)
    ) {
      setSelectedProduct(productWallets[0].productCode);
    }
  }, [productWallets, selectedProduct]);

  const productOptions = useMemo(
    () =>
      productWallets.map((group) => ({
        value: group.productCode,
        label: getProductLabel(group.productCode),
      })),
    [productWallets],
  );

  const activeWallets = useMemo(
    () =>
      productWallets.find((group) => group.productCode === selectedProduct)
        ?.wallets ?? [],
    [productWallets, selectedProduct],
  );

  return {
    translate,
    selectedProduct,
    setSelectedProduct,
    productOptions,
    activeWallets,
  };
}
