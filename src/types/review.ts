import type {
  Country,
  State,
  City,
  ReviewStatus,
  DocumentType,
} from '@/lib/enums';

export interface UserSubmission {
  id: string;
  fullName: string;
  email: string;
  businessName: string;
  status: ReviewStatus;
  businessDetails: {
    registrationId: string;
    businessName: string;
    taxNumber: string;
    businessUrl?: string;
    businessAddress: string;
    country: Country;
    state: State;
    city: City;
    zipCode: string;
    directors?: {
      fullName: string;
      position: string;
      nationality: string;
      passportNoNationalId: string;
    }[];
    beneficialOwners?: {
      fullName: string;
      position: string;
      nationality: string;
      passportNoNationalId: string;
    }[];
  };
  documents: {
    [DocumentType.BUSINESS_REGISTRATION]?: File;
    [DocumentType.NATIONAL_ADDRESS]?: File;
    [DocumentType.VAT_REGISTRATION]?: File;
  };
  compliance: {
    countryOfOrigin?: Country;
    subjectToSanctions: boolean;
    sanctionsDetails?: string;
    amlCompliance: boolean;
    amlDetails?: string;
    informationAccurate: boolean;
    termsAccepted: boolean;
  };
  submittedAt: Date;
}

export interface RevisionRequest {
  fieldPath: string;
  reason: string;
}

/** When a reviewer marks a field for revision or clears that request. */
export type RevisionFieldCallbacks = {
  onRevisionRequest: (fieldPath: string, reason: string) => void;
  onRevisionClear: (fieldPath: string) => void;
};

export interface ReviewDecision {
  userId: string;
  action: 'approve' | 'request-revision' | 'reject';
  revisionRequests?: RevisionRequest[];
  reviewerNotes?: string;
}

export interface ReviewRequestPayload {
  tenantId: string;
  customerProfilesDataId: string;
  businessDetailsMetadata?: Record<string, string>;
  attachmentsMetadata?: Record<string, string>;
  directorsMetadata?: Record<string, Record<string, string>>;
  beneficialOwnerMetadata?: Record<string, Record<string, string>>;
  complianceDeclarationsMetadata?: Record<string, string>;
  reviewerId: string;
}
