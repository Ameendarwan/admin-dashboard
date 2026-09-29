'use client';

// import { LinkButton } from '@merit-incentives/ui';
// import { ArrowRight, User } from 'lucide-react';
import { User } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import type { MouseEvent } from 'react';

import type { ActivationRequestDetail } from '@/types/catalog';

import { TenantDetailField } from '../TenantDetailField';

interface ActivationRequestTenantSectionProps {
  detail: ActivationRequestDetail;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function ActivationRequestTenantSection({
  detail,
  translate,
}: Readonly<ActivationRequestTenantSectionProps>) {
  // const router = useRouter();
  // const tenantId = detail.tenantId;

  // const handleTenantDetailsClick = (event: MouseEvent<HTMLElement>) => {
  //   event.preventDefault();
  //   router.push(
  //     `/tenant-management/${encodeURIComponent(tenantId)}?tenantId=${encodeURIComponent(tenantId)}&name=${encodeURIComponent(detail.businessName)}&email=${encodeURIComponent(detail.businessOwnerEmail)}`,
  //   );
  // };

  return (
    <section className="overflow-hidden rounded-2xl bg-white">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-mds-black-600" aria-hidden />
          <h2 className="text-[18px] font-medium leading-[1.2] text-mds-black-900">
            {translate('giftCardManagement.detail.tenantDetails')}
          </h2>
        </div>

        {/* <LinkButton
          variant="primary"
          type="button"
          size="lg"
          className="rounded-full px-5"
          onClick={handleTenantDetailsClick}
          rightIcon={<ArrowRight className="h-5 w-5" aria-hidden />}
        >
          {translate('giftCardManagement.detail.tenantDetails')}
        </LinkButton> */}
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 px-6 pb-6 sm:grid-cols-2 lg:grid-cols-5">
        <TenantDetailField
          label={translate('giftCardManagement.detail.tenantId')}
          value={detail.tenantId}
        />
        <TenantDetailField
          label={translate('giftCardManagement.detail.business')}
          value={detail.businessName}
        />
        <TenantDetailField
          label={translate('giftCardManagement.detail.businessOwner')}
          value={
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mds-primary-700 text-xs font-semibold text-white">
                {detail.businessOwnerInitial}
              </span>
              <span
                className="min-w-0 truncate"
                title={detail.businessOwnerEmail}
              >
                {detail.businessOwnerEmail}
              </span>
            </span>
          }
        />
        <TenantDetailField
          label={translate('giftCardManagement.detail.accountStatus')}
          value={detail.accountStatus}
        />
        {/* <TenantDetailField
          label={translate('giftCardManagement.detail.kybStatus')}
          value={detail.kybStatus}
        />
        <TenantDetailField
          label={translate('giftCardManagement.detail.complianceFlag')}
          value={detail.complianceFlag}
        />
        <TenantDetailField
          label={translate('giftCardManagement.detail.activeCards')}
          value={detail.activeCards}
        />
        <TenantDetailField
          label={translate('giftCardManagement.detail.orders30Days')}
          value={detail.ordersLast30Days}
        />
        <TenantDetailField
          label={translate('giftCardManagement.detail.floatBalance')}
          value={detail.floatBalance}
        /> */}
      </div>
    </section>
  );
}
