'use client';

import { useParams } from 'next/navigation';

import { CreateStorefrontPageClient } from '@/components/CreateStorefront';
import { readRouteParamId } from '@/utils/routeUtils';

export default function CreateStorefrontPage() {
  const params = useParams();
  const tenantProfileId = readRouteParamId(params.id);

  return (
    <CreateStorefrontPageClient
      variant="tenant"
      tenantProfileId={tenantProfileId}
    />
  );
}
