import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Files,
  HomeIcon,
  PanelsTopLeft,
  Smartphone,
  UserCog,
  Users,
} from 'lucide-react';

import { SIDEBAR_ITEM_IDS, SIDEBAR_ROUTES } from '@/constants/sidebar';

import { useLocalization } from './useLocalization';

interface SidebarSubmenuItem {
  key: string;
  label: string;
  onClick: () => void;
}

interface SidebarItem {
  href?: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  isActive?: boolean;
  key: string;
  label: string;
  onClick?: () => void;
  submenu?: SidebarSubmenuItem[];
}

export function useSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { translate } = useLocalization('sidebar');

  const getActiveItem = () => {
    if (pathname?.includes(SIDEBAR_ROUTES.ACCESS_MANAGEMENT)) {
      return SIDEBAR_ITEM_IDS.ACCESS_MANAGEMENT;
    }
    if (
      pathname?.includes(SIDEBAR_ROUTES.CATEGORY_MANAGEMENT) ||
      pathname?.includes(SIDEBAR_ROUTES.GIFT_CARD_MANAGEMENT) ||
      pathname?.includes('/catalog-management')
    ) {
      return SIDEBAR_ITEM_IDS.CATALOG_MANAGEMENT;
    }
    if (pathname?.includes(SIDEBAR_ROUTES.SUPER_APP)) {
      return SIDEBAR_ITEM_IDS.SUPER_APP;
    }
    if (
      pathname?.includes(SIDEBAR_ROUTES.SELLERS) ||
      pathname?.includes(SIDEBAR_ROUTES.SAAS_TENANTS)
    ) {
      return SIDEBAR_ITEM_IDS.TENANT_MANAGEMENT;
    }
    if (pathname?.includes(SIDEBAR_ROUTES.TENANT_MANAGEMENT)) {
      return SIDEBAR_ITEM_IDS.TENANT_MANAGEMENT;
    }
    if (pathname?.includes(SIDEBAR_ROUTES.REWARDS_PORTAL)) {
      return SIDEBAR_ITEM_IDS.REWARDS_PORTAL;
    }
    if (pathname?.includes(SIDEBAR_ROUTES.STOREFRONTS)) {
      return SIDEBAR_ITEM_IDS.STOREFRONT;
    }
    if (pathname?.includes(SIDEBAR_ROUTES.DASHBOARD)) {
      return SIDEBAR_ITEM_IDS.DASHBOARD;
    }
    return SIDEBAR_ITEM_IDS.DASHBOARD;
  };

  const activeItem = getActiveItem();

  const sidebarItems: SidebarItem[] = useMemo(
    () => [
      {
        icon: <HomeIcon className="h-5 w-5" />,
        isActive: activeItem === SIDEBAR_ITEM_IDS.DASHBOARD,
        key: SIDEBAR_ITEM_IDS.DASHBOARD,
        label: translate('dashboard'),
        onClick: () => router.push(SIDEBAR_ROUTES.DASHBOARD),
      },
      {
        icon: <Users className="h-5 w-5" />,
        isActive: activeItem === SIDEBAR_ITEM_IDS.TENANT_MANAGEMENT,
        key: SIDEBAR_ITEM_IDS.TENANT_MANAGEMENT,
        label: translate('tenantManagement'),
        submenu: [
          {
            key: SIDEBAR_ITEM_IDS.SAAS_TENANTS,
            label: translate('saasTenants'),
            onClick: () => router.push(SIDEBAR_ROUTES.SAAS_TENANTS),
          },
          {
            key: SIDEBAR_ITEM_IDS.SELLERS,
            label: translate('sellers'),
            onClick: () => router.push(SIDEBAR_ROUTES.SELLERS),
          },
        ],
      },
      {
        icon: <UserCog className="h-5 w-5" />,
        isActive: activeItem === SIDEBAR_ITEM_IDS.ACCESS_MANAGEMENT,
        key: SIDEBAR_ITEM_IDS.ACCESS_MANAGEMENT,
        label: translate('accessManagement'),
        onClick: () => router.push(SIDEBAR_ROUTES.ACCESS_MANAGEMENT),
      },
      {
        icon: <Smartphone className="h-5 w-5" />,
        isActive: activeItem === SIDEBAR_ITEM_IDS.SUPER_APP,
        key: SIDEBAR_ITEM_IDS.SUPER_APP,
        label: translate('superApp'),
        submenu: [
          {
            key: SIDEBAR_ITEM_IDS.BANNERS_CONFIGURATION,
            label: translate('bannersConfiguration'),
            onClick: () => router.push(SIDEBAR_ROUTES.BANNERS_CONFIGURATION),
          },
        ],
      },
      {
        icon: <Files className="h-5 w-5" />,
        isActive: activeItem === SIDEBAR_ITEM_IDS.CATALOG_MANAGEMENT,
        key: SIDEBAR_ITEM_IDS.CATALOG_MANAGEMENT,
        label: translate('catalogManagement'),
        submenu: [
          {
            key: SIDEBAR_ITEM_IDS.LISTINGS_OFFERS,
            label: translate('listingsAndOffers'),
            onClick: () => router.push(SIDEBAR_ROUTES.CATALOG_LISTINGS),
          },
          {
            key: SIDEBAR_ITEM_IDS.CATEGORY_MANAGEMENT,
            label: translate('categoryManagement'),
            onClick: () => router.push(SIDEBAR_ROUTES.CATEGORY_MANAGEMENT),
          },
          {
            key: SIDEBAR_ITEM_IDS.GIFT_CARD_MANAGEMENT,
            label: translate('giftCardManagement'),
            onClick: () => router.push(SIDEBAR_ROUTES.GIFT_CARD_MANAGEMENT),
          },
        ],
      },
      {
        icon: <BadgeCheck className="h-5 w-5" />,
        isActive: activeItem === SIDEBAR_ITEM_IDS.REWARDS_PORTAL,
        key: SIDEBAR_ITEM_IDS.REWARDS_PORTAL,
        label: translate('rewardsPortal'),
        onClick: () => router.push(SIDEBAR_ROUTES.REWARDS_PORTAL),
      },
      {
        icon: <PanelsTopLeft className="h-5 w-5" />,
        isActive: activeItem === SIDEBAR_ITEM_IDS.STOREFRONT,
        key: SIDEBAR_ITEM_IDS.STOREFRONT,
        label: translate('storefronts'),
        onClick: () => router.push(SIDEBAR_ROUTES.STOREFRONTS),
      },
    ],
    [translate, activeItem, router],
  );

  return {
    sidebarItems,
  };
}
