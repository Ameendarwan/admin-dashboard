import type {
  BaseProfile,
  BaseProfileData,
  BeneficialOwnerMetadata,
  BusinessDetailsMetadata,
  DirectorMetadata,
} from './shared';

export interface Seller extends BaseProfile {
  customerProfileData: SellerProfileData[];
}

export type SellerProfileData = BaseProfileData;

export interface SellerStoreBrandingFile {
  fileName?: string | null;
  url?: string | null;
}

export interface SellerNotificationsTypeConfig {
  throttleMinutes?: number;
  lastSentAt?: string | null;
}

export interface SellerNotificationsConfig {
  emails?: string[];
  new_order?: SellerNotificationsTypeConfig;
  awb_ready?: SellerNotificationsTypeConfig;
}

export interface SellerDetails {
  onboarded: boolean;
  phone: string | null;
  shippingProvider: 'merit_logistics' | 'self_managed' | 'ship_to_merit' | null;
  supplierId: string;
  primaryContactEmail?: string;
  fullName?: string;
  tenantName?: string | null;
  status?: string | null;
  companyName: string | null;
  businessRegistrationId: string | null;
  signedUrl: string | null;
  defaultLastMileCarrier?: string | null;
  storeLogo?: SellerStoreBrandingFile | null;
  storeBanner?: SellerStoreBrandingFile | null;
  notificationsConfig?: SellerNotificationsConfig;
}

export type OrderStatus =
  | 'IN_PROCESS'
  | 'CONFIRMED'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED'
  | 'SHIPPED_TO_MERIT_PENDING'
  | 'SHIPPED_TO_MERIT_COMPLETE'
  | 'RETURN_PENDING'
  | 'RETURN_COMPLETE';

export interface Order {
  id: string;
  merchandizeOrderId: string;
  supplierId: string;
  supplierOrderId: string;
  referenceId: string;
  placedAt: string;
  updatedAt: string;
  itemsCount: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  orderTenantName: string | null;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  instructions: string;
  shippingProvider: 'merit_logistics' | 'self_managed' | 'ship_to_merit' | null;
  carrierName?: string | null;
  trackingId?: string | null;
  trackingUrl?: string | null;
  slaDisplay?: string | null;
  items?: {
    id: string;
    name: string;
    qty: number;
  }[];
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrdersByStatus {
  IN_PROCESS: number;
  CONFIRMED: number;
  READY_TO_SHIP: number;
  SHIPPED: number;
  DELIVERED: number;
  CANCELED: number;
  timeRange: string;
  startDate: string;
  endDate: string;
}

export type TimeRange =
  | 'today'
  | 'last_3_days'
  | 'last_week'
  | 'last_month'
  | 'custom_range';

export interface SellerKybBusinessMetadataExtension {
  businessNameAr?: string;
  iban?: string;
  bankName?: string;
  currency?: string;
}

export type SellerKybBusinessMetadata = BusinessDetailsMetadata &
  SellerKybBusinessMetadataExtension;

export interface SellerKybPersonExtension {
  fullNameAr?: string;
  dateOfBirth?: string;
}

export type SellerKybPrincipalPerson = (
  | DirectorMetadata
  | BeneficialOwnerMetadata
) &
  SellerKybPersonExtension;

export type {
  Attachment,
  BeneficialOwnerMetadata,
  BusinessDetailsMetadata,
  ComplianceDeclarationsMetadata,
  DirectorMetadata,
} from './shared';
