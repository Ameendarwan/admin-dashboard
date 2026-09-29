import { DESCRIPTION_SCROLL_AREA_CLASS } from '@/app/(protected)/catalog-management/constants/offerDetailConstants';

interface CatalogProductDescriptionProps {
  text: string;
}

/** Fixed-height, scrollable product description for catalog detail views. */
export function CatalogProductDescription({
  text,
}: Readonly<CatalogProductDescriptionProps>) {
  return <div className={DESCRIPTION_SCROLL_AREA_CLASS}>{text}</div>;
}
