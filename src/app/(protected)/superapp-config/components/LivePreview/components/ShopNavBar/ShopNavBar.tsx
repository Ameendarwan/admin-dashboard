'use client';

import { Button } from '@merit-incentives/ui';
import { Search, ShoppingCart } from 'lucide-react';

import { useLocalization } from '@/hooks/useLocalization';

export function ShopNavBar() {
  const { translate } = useLocalization('media-management');

  return (
    <div className="flex items-center justify-between px-4 pb-3">
      <h1 className="text-[17px] font-semibold text-mds-black-900">
        {translate('livePreview.shop')}
      </h1>
      <div className="flex items-center gap-3">
        <Button className="text-mds-gray-600 bg-transparent! border-none! p-0! hover:bg-transparent! min-w-0! w-5! h-5!">
          <Search className="w-5 h-5" />
        </Button>
        <Button className="text-mds-gray-600 bg-transparent! border-none! p-0! hover:bg-transparent! min-w-0! w-5! h-5!">
          <ShoppingCart className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
