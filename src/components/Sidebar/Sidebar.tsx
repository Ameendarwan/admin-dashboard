'use client';

import { Sidebar as MeritSidebar } from '@merit-incentives/ui';

import { useSidebar } from '@/hooks/useSidebar';

export function Sidebar() {
  const { sidebarItems } = useSidebar();

  return <MeritSidebar items={sidebarItems} size="md" className="hover:w-64" />;
}
