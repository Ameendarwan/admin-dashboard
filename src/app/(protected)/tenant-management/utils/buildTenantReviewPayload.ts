import { MetadataType } from '@/lib/enums';
import type { ReviewRequestPayload, RevisionRequest } from '@/types/review';
import type { DetailedTenantProfile } from '@/types/tenantManagement';

export function buildTenantReviewPayload(
  revisionRequests: RevisionRequest[],
  tenant: DetailedTenantProfile,
  tenantIdParam: string,
): ReviewRequestPayload {
  const payload: ReviewRequestPayload = {
    tenantId: tenantIdParam,
    customerProfilesDataId: tenant.customerProfileData[0]?.id || '',
    reviewerId: tenant.id,
  };

  revisionRequests.forEach((request) => {
    const parts = request.fieldPath.split('.');
    const metadataType = parts[0];
    const fieldName = parts[1];

    if (metadataType === MetadataType.BUSINESS_DETAILS) {
      payload.businessDetailsMetadata = payload.businessDetailsMetadata || {};
      payload.businessDetailsMetadata[fieldName] = request.reason;
    }
    if (metadataType === MetadataType.ATTACHMENTS) {
      payload.attachmentsMetadata = payload.attachmentsMetadata || {};
      payload.attachmentsMetadata[fieldName] = request.reason;
    }
    if (metadataType === MetadataType.DIRECTORS) {
      const directorId = parts[1];
      const directorField = parts[2];
      payload.directorsMetadata = payload.directorsMetadata || {};
      if (!payload.directorsMetadata[directorId]) {
        payload.directorsMetadata[directorId] = {};
      }
      payload.directorsMetadata[directorId][directorField] = request.reason;
    }
    if (metadataType === MetadataType.BENEFICIAL_OWNERS) {
      const ownerId = parts[1];
      const ownerField = parts[2];
      payload.beneficialOwnerMetadata = payload.beneficialOwnerMetadata || {};
      if (!payload.beneficialOwnerMetadata[ownerId]) {
        payload.beneficialOwnerMetadata[ownerId] = {};
      }
      payload.beneficialOwnerMetadata[ownerId][ownerField] = request.reason;
    }
    if (metadataType === MetadataType.COMPLIANCE) {
      payload.complianceDeclarationsMetadata =
        payload.complianceDeclarationsMetadata || {};
      payload.complianceDeclarationsMetadata[fieldName] = request.reason;
    }
  });

  return payload;
}
