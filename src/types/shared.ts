// Shared types used across different profile types

export interface Attachment {
  id: string;
  attachableId: string;
  attachableType: string;
  attachmentType: string;
  filePath: string;
  fileType: string;
  fileSize: string;
  fileName: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl: string;
}

export interface ComplianceDeclarationsMetadata {
  countryOfOrigin: string;
  subjectToSanctions: boolean;
  sanctionsDetails?: string;
  amlCftCompliance: boolean;
  amlCftDetails?: string;
  termsAndConditionsAgreed: boolean;
  informationAccuracyConfirmed: boolean;
}

export interface BusinessDetailsMetadata {
  businessName: string;
  businessRegistrationId: string;
  taxNumber: string;
  businessUrl: string;
  businessAddress: string;
  country: string;
  state: string;
  zipPostalCode: string;
  city: string;
}

export interface DirectorMetadata {
  fullName: string;
  position: string;
  nationality: string;
  passportNumberOrNationalId: string;
}

export interface BeneficialOwnerMetadata {
  fullName: string;
  position: string;
  nationality: string;
  passportNumberOrNationalId: string;
}

export interface BaseProfileData {
  id: string;
  customerProfileId: string;
  version: number;
  tenantId: string;
  businessDetailsMetadata: BusinessDetailsMetadata;
  directorsMetadata: DirectorMetadata[] | null;
  beneficialOwnerMetadata: BeneficialOwnerMetadata[] | null;
  attachments: Attachment[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface BaseProfile {
  id: string;
  userId: string;
  subscriptionId: string | null;
  tenantId: string;
  complianceDeclarationsMetadata: ComplianceDeclarationsMetadata;
  state: string;
  step: string;
  approvedCustomerProfileDataId: string | null;
  createdAt: string;
  updatedAt: string;
  businessName?: string;
  schemaName?: string;
  name: string;
  email: string;
}
