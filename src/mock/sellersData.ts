import { Seller } from '@/types/seller';
import { SellerStatus } from '@/lib/enums';

// Order and SLA data types for seller details
export interface OrderData {
  id: string;
  orderNumber: string;
  customer: string;
  items: number;
  sla: string;
  status: string;
}

export interface SLAData {
  id: string;
  metric: string;
  target: string;
  actual: string;
  status: string;
  compliance: string;
}

// Mock orders data
export const mockOrdersData: OrderData[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customer: 'John Doe',
    items: 50,
    sla: '2 days',
    status: 'Completed',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customer: 'Jane Smith',
    items: 35,
    sla: '1 day',
    status: 'Pending',
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customer: 'Bob Johnson',
    items: 120,
    sla: '3 days',
    status: 'Processing',
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customer: 'Sarah Wilson',
    items: 75,
    sla: '2 days',
    status: 'Completed',
  },
];

// Mock SLA data
export const mockSLAData: SLAData[] = [
  {
    id: '1',
    metric: 'Response Time',
    target: '< 2 hours',
    actual: '1.5 hours',
    status: 'Compliant',
    compliance: '95%',
  },
  {
    id: '2',
    metric: 'Order Fulfillment',
    target: '< 24 hours',
    actual: '26 hours',
    status: 'Non-Compliant',
    compliance: '87%',
  },
  {
    id: '3',
    metric: 'Customer Satisfaction',
    target: '> 90%',
    actual: '92%',
    status: 'Compliant',
    compliance: '98%',
  },
];

// Base compliance metadata template
const baseComplianceMetadata = {
  subjectToSanctions: false,
  amlCftCompliance: true,
  termsAndConditionsAgreed: true,
  informationAccuracyConfirmed: true,
};

// Helper to create a seller profile
const createSeller = (
  id: string,
  data: {
    userId: string;
    subscriptionId: string | null;
    tenantId: string;
    countryOfOrigin: string;
    state: SellerStatus;
    step: string;
    approvedCustomerProfileDataId: string | null;
    createdAt: string;
    updatedAt: string;
    businessName: string;
    schemaName: string;
    name: string;
    email: string;
    businessDetails: {
      businessRegistrationId: string;
      taxNumber: string;
      businessUrl: string;
      businessAddress: string;
      country: string;
      state: string;
      zipPostalCode: string;
      city: string;
    };
    directors?: Array<{
      fullName: string;
      position: string;
      nationality: string;
      passportNumberOrNationalId: string;
    }> | null;
    beneficialOwners?: Array<{
      fullName: string;
      position: string;
      nationality: string;
      passportNumberOrNationalId: string;
    }> | null;
  },
): Seller => ({
  id,
  userId: data.userId,
  subscriptionId: data.subscriptionId,
  tenantId: data.tenantId,
  complianceDeclarationsMetadata: {
    ...baseComplianceMetadata,
    countryOfOrigin: data.countryOfOrigin,
  },
  state: data.state,
  step: data.step,
  approvedCustomerProfileDataId: data.approvedCustomerProfileDataId,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  businessName: data.businessName,
  schemaName: data.schemaName,
  name: data.name,
  email: data.email,
  customerProfileData: [
    {
      id: `data-${id.padStart(3, '0')}`,
      customerProfileId: id,
      version: 1,
      tenantId: data.tenantId,
      businessDetailsMetadata: {
        businessName: data.businessName,
        ...data.businessDetails,
      },
      directorsMetadata: data.directors || null,
      beneficialOwnerMetadata: data.beneficialOwners || null,
      attachments: null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    },
  ],
});

export const mockSellersData: Seller[] = [
  createSeller('1', {
    userId: 'user-001',
    subscriptionId: 'sub-001',
    tenantId: 'tenant-001',
    countryOfOrigin: 'sa',
    state: SellerStatus.INVITE_ACCEPTED,
    step: 'compliance-declarations',
    approvedCustomerProfileDataId: 'profile-001',
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-12-01T14:20:00Z',
    businessName: 'Tech Solutions Arabia',
    schemaName: 'tech_solutions',
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@techsolutions.sa',
    businessDetails: {
      businessRegistrationId: 'CR-7654321',
      taxNumber: 'VAT-SA-123456',
      businessUrl: 'https://techsolutions.sa',
      businessAddress: '123 King Fahd Road',
      country: 'sa',
      state: 'riyadh-province',
      zipPostalCode: '11564',
      city: 'riyadh',
    },
    directors: [
      {
        fullName: 'Ahmed Al-Rashid',
        position: 'CEO',
        nationality: 'Saudi Arabian',
        passportNumberOrNationalId: 'SA-1234567890',
      },
    ],
    beneficialOwners: [
      {
        fullName: 'Ahmed Al-Rashid',
        position: 'Owner',
        nationality: 'Saudi Arabian',
        passportNumberOrNationalId: 'SA-1234567890',
      },
    ],
  }),
  createSeller('2', {
    userId: 'user-002',
    subscriptionId: 'sub-002',
    tenantId: 'tenant-002',
    countryOfOrigin: 'ae',
    state: SellerStatus.INVITE_SENT,
    step: 'business-details',
    approvedCustomerProfileDataId: null,
    createdAt: '2024-12-05T09:15:00Z',
    updatedAt: '2024-12-05T09:15:00Z',
    businessName: 'Digital Commerce Hub',
    schemaName: 'digital_commerce',
    name: 'Sarah Johnson',
    email: 'sarah@digitalcommerce.ae',
    businessDetails: {
      businessRegistrationId: 'CR-UAE-98765',
      taxNumber: 'TRN-100234567',
      businessUrl: 'https://digitalcommerce.ae',
      businessAddress: '456 Sheikh Zayed Road',
      country: 'uae',
      state: 'dubai',
      zipPostalCode: '00000',
      city: 'dubai',
    },
  }),
];

// Helper function to filter sellers by status
export const filterSellersByStatus = (
  sellers: Seller[],
  status: string,
): Seller[] => {
  if (!status) return sellers;
  return sellers.filter((seller) => seller.state === status);
};

// Helper function to search sellers
export const searchSellers = (
  sellers: Seller[],
  searchQuery: string,
): Seller[] => {
  if (!searchQuery) return sellers;

  const query = searchQuery.toLowerCase();
  return sellers.filter(
    (seller) =>
      seller.businessName?.toLowerCase().includes(query) ||
      seller.name.toLowerCase().includes(query) ||
      seller.email.toLowerCase().includes(query),
  );
};

// Helper function to paginate sellers
export const paginateSellers = (
  sellers: Seller[],
  page: number,
  pageSize: number,
) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: sellers.slice(startIndex, endIndex),
    page,
    totalPages: Math.ceil(sellers.length / pageSize),
    total: sellers.length,
  };
};

// Main function to get paginated and filtered sellers
export const getSellersData = (
  page: number,
  pageSize: number,
  searchQuery: string = '',
  statusFilter: string = '',
) => {
  let filteredSellers = mockSellersData;

  // Apply search filter
  filteredSellers = searchSellers(filteredSellers, searchQuery);

  // Apply status filter
  filteredSellers = filterSellersByStatus(filteredSellers, statusFilter);

  // Paginate results
  return paginateSellers(filteredSellers, page, pageSize);
};
