'use client';

import { useParams } from 'next/navigation';

import { GiftCardDetailClient } from '@/app/(protected)/gift-card-management/components';

export default function GiftCardDetailPage() {
  const params = useParams();
  const productId = String(params?.productId ?? '');

  return <GiftCardDetailClient productId={productId} />;
}
