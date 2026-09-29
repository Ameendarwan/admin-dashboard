'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { toast } from '@merit-incentives/ui';
import { Button } from '@merit-incentives/ui/components';
import { Pencil } from 'lucide-react';

import { ReviewMode, ReviewStatus } from '@/lib/enums';
import { RevisionRequest } from '@/types/review';
import { ConfirmationPopup } from '@/components/ConfirmationPopup';
import { Spinner } from '@/components/Spinner';
import { useTenantProfileById } from '@/api-queries/tenantManagement';
import { useLocalization } from '@/hooks/useLocalization';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import { useSubmitReview } from '@/api-queries/review/useSubmitReview';
import { useUpdateTenantState } from '@/api-queries/tenantManagement/useUpdateTenantState';
import { BackButton } from '@/components/BackButton';
import { tenantStateAllowsKybReviewActions } from '@/utils/tenantDetailReviewUi';

import {
  EditTenantDialog,
  RevisionRequestControl,
  TenantDetailsTabs,
  TenantSummaryCard,
} from '../components';
import { buildTenantReviewPayload } from '../utils/buildTenantReviewPayload';
export default function TenantDetailsPage() {
  const { shouldShowLoading } = useRouteProtection();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlParams = useParams();
  const { translate: tDetails } = useLocalization('tenant-details');
  const { translate: tReview } = useLocalization('user-review-page');
  const [mode, setMode] = useState<ReviewMode>(ReviewMode.VIEW);
  const [revisionRequests, setRevisionRequests] = useState<RevisionRequest[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [editTenantOpen, setEditTenantOpen] = useState(false);
  const submitReviewMutation = useSubmitReview();

  const tenantId = searchParams.get('tenantId') || '';
  const tenantName = decodeURIComponent(searchParams.get('name') || '');
  const tenantEmail = decodeURIComponent(searchParams.get('email') || '');
  const accountManager = decodeURIComponent(
    searchParams.get('accountManager') || '',
  );
  const countryCode = decodeURIComponent(searchParams.get('country') || '');

  const updateTenantStateMutation = useUpdateTenantState();

  const {
    data: tenant,
    isLoading,
    error,
  } = useTenantProfileById(urlParams.id as string, tenantId);

  const handleCancelRevisionMode = useCallback(() => {
    setMode(ReviewMode.VIEW);
    setRevisionRequests([]);
  }, []);

  useEffect(() => {
    if (!tenant?.state) return;
    if (!tenantStateAllowsKybReviewActions(tenant.state)) {
      setMode(ReviewMode.VIEW);
    }
  }, [tenant?.state]);

  if (shouldShowLoading) {
    return null;
  }

  if (isLoading) {
    return <Spinner fullHeight text={tReview('loading')} />;
  }

  if (error || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {tReview('userNotFound')}
          </h1>
          <Button
            variant="primary"
            onClick={() => router.push('/tenant-management')}
          >
            {tReview('backToTenantManagement')}
          </Button>
        </div>
      </div>
    );
  }

  const handleRevisionRequest = (fieldPath: string, reason: string) => {
    setRevisionRequests((prev) => [
      ...prev.filter((req) => req.fieldPath !== fieldPath),
      { fieldPath, reason },
    ]);
  };

  const handleRevisionClear = (fieldPath: string) => {
    setRevisionRequests((prev) =>
      prev.filter((req) => req.fieldPath !== fieldPath),
    );
  };

  const handleApprove = async () => {
    try {
      await updateTenantStateMutation.mutateAsync({
        tenantId: tenant.tenantId || '',
        customerProfileDataId: tenant.customerProfileData[0]?.id || '',
        state: ReviewStatus.APPROVED,
      });
      router.push('/tenant-management');
    } catch {
      toast.error(tReview('stateUpdateFailed'));
    }
  };

  const handleReject = async () => {
    try {
      await updateTenantStateMutation.mutateAsync({
        tenantId: tenant.tenantId || '',
        customerProfileDataId: tenant.customerProfileData[0]?.id || '',
        state: ReviewStatus.REJECTED,
      });
      router.push('/tenant-management');
    } catch {
      toast.error(tReview('stateUpdateFailed'));
    }
  };

  const handleSendRevisionRequest = async () => {
    if (revisionRequests.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = buildTenantReviewPayload(
        revisionRequests,
        tenant,
        tenantId,
      );
      await submitReviewMutation.mutateAsync(payload);
      setShowSuccessPopup(true);
    } catch {
      alert('Failed to send revision request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRevisionMode = mode === ReviewMode.REVISION;
  const canKybReviewActions = tenantStateAllowsKybReviewActions(tenant.state);
  const reviewModeForUi = canKybReviewActions ? mode : ReviewMode.VIEW;
  const isUpdatingTenantState = updateTenantStateMutation.isPending;

  const businessDetails =
    tenant.customerProfileData[0]?.businessDetailsMetadata;
  const directors = tenant.customerProfileData[0]?.directorsMetadata || [];
  const beneficialOwners =
    tenant.customerProfileData[0]?.beneficialOwnerMetadata || [];
  const attachedDocuments = tenant.customerProfileData[0]?.attachments ?? null;
  const compliance = tenant.complianceDeclarationsMetadata;

  const displayCountryCode =
    countryCode || businessDetails?.country || compliance?.countryOfOrigin;

  return (
    <div className="min-h-screen pb-10 pt-2 md:pb-12 md:pt-4">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8">
        <div className="flex flex-col gap-4 mb-4 md:mb-6">
          <BackButton />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-[34px] font-medium text-mds-black-900">
              {tDetails('title')}
            </h1>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {canKybReviewActions && (
                <RevisionRequestControl
                  isRevisionMode={isRevisionMode}
                  isSubmitting={isSubmitting}
                  hasRevisionRequests={revisionRequests.length > 0}
                  onEnterRevisionMode={() => setMode(ReviewMode.REVISION)}
                  onSendRevisionRequest={handleSendRevisionRequest}
                  onCancelRevisionMode={handleCancelRevisionMode}
                />
              )}
              {canKybReviewActions && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => void handleApprove()}
                    loading={isUpdatingTenantState}
                    disabled={
                      tenant.state === ReviewStatus.APPROVED ||
                      isUpdatingTenantState
                    }
                    className="w-47 bg-mds-success-500 hover:bg-mds-success-800"
                  >
                    {tReview('actions.approve')}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => void handleReject()}
                    loading={isUpdatingTenantState}
                    disabled={
                      tenant.state === ReviewStatus.REJECTED ||
                      isUpdatingTenantState
                    }
                    className="w-47 shrink-0 border-transparent bg-mds-error-500 !text-white hover:bg-mds-error-700 hover:!text-white"
                  >
                    {tReview('actions.reject')}
                  </Button>
                </>
              )}
              <Button
                variant="primary"
                leftIcon={<Pencil className="h-4 w-4" />}
                className={canKybReviewActions ? undefined : 'ml-0'}
                disabled={!tenantId}
                onClick={() => setEditTenantOpen(true)}
              >
                {tDetails('editTenant')}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <TenantSummaryCard
            tenant={tenant}
            tenantId={tenantId}
            tenantName={tenantName}
            tenantEmail={tenantEmail}
            accountManager={accountManager}
            countryCode={displayCountryCode}
          />
        </div>

        <TenantDetailsTabs
          tenant={tenant}
          accountManager={accountManager}
          tenantEmailFromUrl={tenantEmail}
          businessDetails={businessDetails}
          directors={directors}
          beneficialOwners={beneficialOwners}
          attachedDocuments={attachedDocuments}
          compliance={compliance}
          mode={reviewModeForUi}
          tenantId={tenantId}
          onRevisionRequest={handleRevisionRequest}
          onRevisionClear={handleRevisionClear}
        />

        <EditTenantDialog
          isOpen={editTenantOpen}
          onClose={() => setEditTenantOpen(false)}
          tenantId={tenantId}
          onSaved={(values) => {
            const next = new URLSearchParams(searchParams.toString());
            next.set('name', encodeURIComponent(values.businessName));
            next.set(
              'accountManager',
              encodeURIComponent(values.accountManager || ''),
            );
            next.set('country', encodeURIComponent(values.country || ''));
            router.replace(`${pathname}?${next.toString()}`);
          }}
        />

        <ConfirmationPopup
          isOpen={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          type="success"
          title={tReview('RevisionRequestSentPopup.title')}
          description={tReview('RevisionRequestSentPopup.description')}
          primaryButton={{
            text: 'Continue',
            variant: 'primary',
          }}
          onPrimaryAction={() => {
            setShowSuccessPopup(false);
            router.push('/tenant-management');
          }}
        />
      </div>
    </div>
  );
}
