import { AuditLogEntry, BannerId, CarouselIconId } from '@/types/superApp';
import { MediaItemData } from '@/app/(protected)/superapp-config/hooks';

/**
 * Helper function to create a banner media item with default values
 */
const createBannerItem = (id: BannerId, title: string): MediaItemData => ({
  id,
  title,
  file: null,
  imagePreview: null,
  deepLink: '',
  isUploaded: false,
});

/**
 * Helper function to create a carousel icon media item with default values
 */
const createIconItem = (
  id: CarouselIconId,
  iconNumber: number,
): MediaItemData => ({
  id,
  title: `Icon ${iconNumber}`,
  file: null,
  imagePreview: null,
  deepLink: '',
  label: `Icon ${iconNumber}`,
  isUploaded: false,
});

/**
 * Helper function to create icon configuration
 */
const createIconConfig = (iconNumber: number, width = 112, height = 112) => ({
  id: `icon${iconNumber}` as CarouselIconId,
  titleKey: `icons.icon${iconNumber}`,
  dimensions: `${width} x ${height} px`,
  requiredWidth: width,
  requiredHeight: height,
});

export const sampleLogs: AuditLogEntry[] = [
  {
    id: '1',
    title: 'Best Deals',
    type: 'Carousel Icon',
    updatedBy: 'Jerome Bell',
    updatedOn: 'Jan 8, 2026 • 5:56 PM',
    imageUrl: '/banner.png',
    status: 'published',
  },
  {
    id: '2',
    title: 'Flash Deals',
    type: 'Carousel Icon',
    updatedBy: 'Jerome Bell',
    updatedOn: 'Jan 8, 2026 • 5:56 PM',
    imageUrl: '/banner.png',
    status: 'published',
  },
  {
    id: '3',
    title: 'Header Promo Banner',
    type: 'Promo Banner',
    updatedBy: 'Courtney Henry',
    updatedOn: 'Jan 8, 2026 • 5:56 PM',
    imageUrl: '/banner.png',
    status: 'published',
  },
  {
    id: '4',
    title: 'Horizontal Promo Banner 2',
    type: 'Promo Banner',
    updatedBy: 'Courtney Henry',
    updatedOn: 'Jan 8, 2026 • 5:56 PM',
    imageUrl: '/banner.png',
    status: 'published',
  },
];

export const initialBanners: Record<BannerId, MediaItemData> = {
  header: createBannerItem('header', 'Header Promo Banner'),
  vertical: createBannerItem('vertical', 'Vertical Promo Banner'),
  horizontal1: createBannerItem('horizontal1', 'Horizontal Promo Banner 1'),
  horizontal2: createBannerItem('horizontal2', 'Horizontal Promo Banner 2'),
};

export const initialCarouselIcons: Record<CarouselIconId, MediaItemData> = {
  icon1: createIconItem('icon1', 1),
  icon2: createIconItem('icon2', 2),
  icon3: createIconItem('icon3', 3),
  icon4: createIconItem('icon4', 4),
  icon5: createIconItem('icon5', 5),
  icon6: createIconItem('icon6', 6),
  icon7: createIconItem('icon7', 7),
};

export const ICON_CONFIG: Array<{
  id: CarouselIconId;
  titleKey: string;
  dimensions: string;
  requiredWidth: number;
  requiredHeight: number;
}> = [
  createIconConfig(1),
  createIconConfig(2),
  createIconConfig(3),
  createIconConfig(4),
  createIconConfig(5),
  createIconConfig(6),
  createIconConfig(7),
];
