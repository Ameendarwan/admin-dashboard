import { Product, ReviewStatus } from '@/lib/enums';

export const TENANT_MANAGEMENT_PRODUCTS: Product[] = [
  Product.LMS,
  Product.INNOVATION,
  Product.POINTS_EXCHANGE,
  Product.STOREFRONT,
];

export const TENANT_MANAGEMENT_PRODUCT_LABELS: Record<Product, string> = {
  [Product.LMS]: 'LMS',
  [Product.INNOVATION]: 'Innovation',
  [Product.POINTS_EXCHANGE]: 'Points Exchange',
  [Product.STOREFRONT]: 'Storefront',
  [Product.SELLER_PORTAL]: 'Seller Portal',
};

export const TENANT_TABLE_ONBOARDING_PENDING_ROW_CLASSNAME =
  'opacity-60 blur-[0.4px] saturate-50';

export const TENANT_TABLE_INVITED_TAB_ROW_CLASSNAME =
  'cursor-not-allowed hover:!bg-mds-white';

export const TENANT_ONBOARDED_TAB_REVIEW_STATUSES: ReviewStatus[] = [
  ReviewStatus.ONBOARDING,
  ReviewStatus.PENDING_REVIEW,
  ReviewStatus.REVIEW_IN_PROGRESS,
  ReviewStatus.REVISION_REQUESTED,
  ReviewStatus.APPROVED,
  ReviewStatus.REJECTED,
];

export const ACCOUNT_MANAGERS = [
  'Nadiah van der Merwe',
  'Sarika Shirsekar',
  'Zarmeena Munir',
  'Aysha Jabbar',
  'Raneem ajana',
  'Heba Wahba',
  'Ahmed Abdelrazek',
  'Rawan Abdalla',
  'Noha Youssef',
];
