export enum OnboardingStep {
  BUSINESS_DETAILS = 'business-details',
  REQUIRED_DOCUMENTS = 'required-documents',
  COMPLIANCE_DECLARATIONS = 'compliance-declarations',
}

export enum Country {
  US = 'us',
  CA = 'ca',
  UK = 'uk',
  AU = 'au',
  SA = 'sa',
  UAE = 'uae',
}

export enum State {
  CALIFORNIA = 'ca',
  NEW_YORK = 'ny',
  TEXAS = 'tx',
  FLORIDA = 'fl',
  RIYADH_PROVINCE = 'riyadh-province',
}

export enum City {
  LOS_ANGELES = 'los-angeles',
  NEW_YORK = 'new-york',
  CHICAGO = 'chicago',
  HOUSTON = 'houston',
  RIYADH = 'riyadh',
}

export enum DocumentType {
  BUSINESS_REGISTRATION = 'businessRegistration',
  NATIONAL_ADDRESS = 'nationalAddress',
  VAT_REGISTRATION = 'vatRegistration',
}

export enum AttachmentType {
  BUSINESS_REGISTRATION = 'business-registration-certificate',
  NATIONAL_ADDRESS = 'national-address-certificate',
  VAT_REGISTRATION = 'vat-registration-certificate',
}

export enum MetadataType {
  BUSINESS_DETAILS = 'businessDetails',
  ATTACHMENTS = 'attachments',
  DIRECTORS = 'directors',
  BENEFICIAL_OWNERS = 'beneficialOwners',
  COMPLIANCE = 'compliance',
}

export enum TooltipPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  DANGER = 'danger',
}

export enum FileType {
  PDF = '.pdf',
  PNG = '.png',
  JPG = '.jpg',
  JPEG = '.jpeg',
}

export enum UploadState {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum RadioValue {
  YES = 'true',
  NO = 'false',
}

export enum ReviewStatus {
  ONBOARDING = 'onboarding',
  PENDING_REVIEW = 'pending-review',
  REVIEW_IN_PROGRESS = 'review-in-progress',
  REVISION_REQUESTED = 'revision-requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum SellerStatus {
  INVITE_SENT = 'invite-sent',
  INVITE_ACCEPTED = 'invite-accepted',
}

export enum ReviewAction {
  APPROVE = 'approve',
  REQUEST_REVISION = 'request-revision',
  REJECT = 'reject',
}

export enum ReviewMode {
  VIEW = 'view',
  REVISION = 'revision',
}

export enum Product {
  LMS = 'lms',
  INNOVATION = 'innovation',
  POINTS_EXCHANGE = 'points-exchange-partnership',
  STOREFRONT = 'storefront',
  SELLER_PORTAL = 'seller-portal',
}

export enum ContactSubject {
  GENERAL_INQUIRY = 'general-inquiry',
  TECHNICAL_SUPPORT = 'technical-support',
  BILLING_QUESTION = 'billing-question',
  FEATURE_REQUEST = 'feature-request',
  BUG_REPORT = 'bug-report',
  OTHER = 'other',
}

export enum UserRole {
  CLIENT = 'client',
  REVIEWER = 'reviewer',
}

export enum ApplicationStatus {
  PENDING_APPROVAL = 'pending-approval',
  REVISION_REQUESTED = 'revision-requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TenantInviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
}

export enum TenantJourney {
  ONBOARDED = 'onboarded',
  INVITED = 'invited',
}

export enum TenantsTableMenuAction {
  VIEW_DETAILS = 'view-details',
  RESEND_INVITE = 'resend-invite',
  REQUEST_REVISION = 'request-revision',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export enum SellersTableMenuAction {
  VIEW_DETAILS = 'view-details',
  RESEND_INVITE = 'resend-invite',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum AccessManagementTableMenuAction {
  EDIT = 'edit',
  DEACTIVATE = 'deactivate',
  RESEND_INVITE = 'resend-invite',
}

export enum UserDomain {
  OPS = 'ops',
  FINANCE = 'finance',
  SALES = 'sales',
  MARKETING = 'marketing',
  TECH = 'tech',
  FRAUD = 'fraud',
}

export enum AccessUserRole {
  ADMIN = 'admin',
  LEAD = 'lead',
  STAFF = 'staff',
}

export enum AccessUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  INVITED = 'invited',
  PENDING = 'pending',
}

// User domain labels mapping
export const USER_DOMAIN_LABELS: Record<UserDomain, string> = {
  [UserDomain.OPS]: 'Ops',
  [UserDomain.FINANCE]: 'Finance',
  [UserDomain.SALES]: 'Sales',
  [UserDomain.MARKETING]: 'Marketing',
  [UserDomain.TECH]: 'Tech',
  [UserDomain.FRAUD]: 'Fraud',
};

// Access user role labels mapping
export const ACCESS_USER_ROLE_LABELS: Record<AccessUserRole, string> = {
  [AccessUserRole.ADMIN]: 'Admin',
  [AccessUserRole.LEAD]: 'Lead',
  [AccessUserRole.STAFF]: 'Staff',
};

// Access user status labels mapping
export const ACCESS_USER_STATUS_LABELS: Record<AccessUserStatus, string> = {
  [AccessUserStatus.ACTIVE]: 'Active',
  [AccessUserStatus.INACTIVE]: 'Inactive',
  [AccessUserStatus.INVITED]: 'Invited',
  [AccessUserStatus.PENDING]: 'Pending',
};

// Country labels mapping
export const COUNTRY_LABELS: Record<Country, string> = {
  [Country.US]: 'United States',
  [Country.CA]: 'Canada',
  [Country.UK]: 'United Kingdom',
  [Country.AU]: 'Australia',
  [Country.SA]: 'Saudi Arabia',
  [Country.UAE]: 'UAE',
};

// State labels mapping
export const STATE_LABELS: Record<State, string> = {
  [State.CALIFORNIA]: 'California',
  [State.NEW_YORK]: 'New York',
  [State.TEXAS]: 'Texas',
  [State.FLORIDA]: 'Florida',
  [State.RIYADH_PROVINCE]: 'Riyadh Province',
};

// City labels mapping
export const CITY_LABELS: Record<City, string> = {
  [City.LOS_ANGELES]: 'Los Angeles',
  [City.NEW_YORK]: 'New York',
  [City.CHICAGO]: 'Chicago',
  [City.HOUSTON]: 'Houston',
  [City.RIYADH]: 'Riyadh',
};

// Document type labels mapping
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  [DocumentType.BUSINESS_REGISTRATION]:
    'Business Registration Certificate (CR)',
  [DocumentType.NATIONAL_ADDRESS]: 'National Address Certificate',
  [DocumentType.VAT_REGISTRATION]: 'VAT Registration Certificate',
};

// Review status labels mapping
export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  [ReviewStatus.ONBOARDING]: 'Onboarding',
  [ReviewStatus.PENDING_REVIEW]: 'Pending Review',
  [ReviewStatus.REVIEW_IN_PROGRESS]: 'Review In Progress',
  [ReviewStatus.REVISION_REQUESTED]: 'Revision Requested',
  [ReviewStatus.APPROVED]: 'Approved',
  [ReviewStatus.REJECTED]: 'Rejected',
};
// Seller status labels mapping
export const SELLER_STATUS_LABELS: Record<SellerStatus, string> = {
  [SellerStatus.INVITE_SENT]: 'Invite Sent',
  [SellerStatus.INVITE_ACCEPTED]: 'Invite Accepted',
};

// Document tooltips mapping
export const DOCUMENT_TOOLTIPS: Record<DocumentType, string> = {
  [DocumentType.BUSINESS_REGISTRATION]:
    'Upload your official business registration certificate issued by the relevant government authority.',
  [DocumentType.NATIONAL_ADDRESS]:
    "Provide a certificate confirming your business's registered address from the national postal service.",
  [DocumentType.VAT_REGISTRATION]:
    'Upload your Value Added Tax registration certificate if your business is VAT registered.',
};

export enum OrderStatus {
  ALL = 'all',
  IN_PROCESS = 'IN_PROCESS',
  CONFIRMED = 'CONFIRMED',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  SHIPPED_TO_MERIT_PENDING = 'SHIPPED_TO_MERIT_PENDING',
  SHIPPED_TO_MERIT_COMPLETE = 'SHIPPED_TO_MERIT_COMPLETE',
  RETURN_PENDING = 'RETURN_PENDING',
  RETURN_COMPLETE = 'RETURN_COMPLETE',
  NEW = 'new',
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled',
}

/** `statusHistory` rows that form the Ship-to-Merit facility cycle timeline (ordered by `createdAt` in UI). */
export const SHIP_TO_MERIT_TIMELINE_CYCLE_STATUSES: readonly OrderStatus[] = [
  OrderStatus.SHIPPED_TO_MERIT_PENDING,
  OrderStatus.SHIPPED_TO_MERIT_COMPLETE,
  OrderStatus.RETURN_PENDING,
  OrderStatus.RETURN_COMPLETE,
];

export enum ShippingProvider {
  MERIT_LOGISTICS = 'merit_logistics',
  SELF_MANAGED = 'self_managed',
  SHIP_TO_MERIT = 'ship_to_merit',
  BY_MERIT = 'by-merit',
  SELF_MANAGED_LEGACY = 'self-managed',
}

export const SELLER_INVITE_SHIPPING_PROVIDERS = [
  {
    value: ShippingProvider.MERIT_LOGISTICS,
    label: 'Merit Logistics (SPL)',
  },
  {
    value: ShippingProvider.SHIP_TO_MERIT,
    label: 'Ship to Merit (STM)',
  },
  {
    value: ShippingProvider.SELF_MANAGED,
    label: 'Self Managed (MFN)',
  },
] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.ALL]: 'All',
  [OrderStatus.NEW]: 'New',
  [OrderStatus.ACCEPTED]: 'Accepted',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.READY_TO_SHIP]: 'Ready to Ship',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.IN_PROCESS]: 'New',
  [OrderStatus.CONFIRMED]: 'Accepted',
  [OrderStatus.CANCELED]: 'Cancelled',
  [OrderStatus.SHIPPED_TO_MERIT_PENDING]: 'Arrival Pending',
  [OrderStatus.SHIPPED_TO_MERIT_COMPLETE]: 'Received',
  [OrderStatus.RETURN_PENDING]: 'QC Failed',
  [OrderStatus.RETURN_COMPLETE]: 'QC Failed',
};

export const SHIP_TO_MERIT_DETAIL_LABELS: Record<string, string> = {
  [OrderStatus.SHIPPED_TO_MERIT_PENDING]: 'Arrival Pending',
  [OrderStatus.SHIPPED_TO_MERIT_COMPLETE]: 'Marked as Received',
  [OrderStatus.RETURN_PENDING]: 'Return pending',
  [OrderStatus.RETURN_COMPLETE]: 'Return Complete',
};

export const REVISION_REASON_MAX_LENGTH = 100;
