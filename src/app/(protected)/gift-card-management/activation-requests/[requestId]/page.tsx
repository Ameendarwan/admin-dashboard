'use client';

import { useParams } from 'next/navigation';

import { ActivationRequestDetailClient } from '@/app/(protected)/gift-card-management/components';

export default function ActivationRequestDetailPage() {
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId;

  return <ActivationRequestDetailClient requestId={requestId} />;
}
