'use client';

import Image from 'next/image';

import { useAuth } from '@/app/contexts';
import { useLocalization } from '@/hooks';

export default function DashboardPage() {
  const { user } = useAuth();
  const { translate, locale } = useLocalization('dashboardPage');

  // Get current date
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="relative h-30 w-full overflow-hidden rounded-2xl bg-[#060628]">
      {/* Background Image Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <Image
          alt=""
          className="h-full w-full object-cover"
          src={'/background.png'}
          fill
          priority
          sizes="100vw"
        />
      </div>

      {/* Header Section with Gradient Background */}
      <div className="absolute inset-0 rounded-2xl">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-r from-[rgba(3,3,31,0)] from-[40.865%] to-[#060628] to-[86.058%]" />

        {/* Content */}
        <div className="relative left-6 top-6 flex flex-col items-start gap-3">
          <p className="text-sm font-medium leading-[1.4] text-mds-white">
            {dateString}
          </p>
          <h1 className="text-[28px] font-semibold leading-[1.2] text-mds-white">
            {translate('goodMorning', { name: user?.tenantName || 'Admin' })}
          </h1>
        </div>
      </div>
    </div>
  );
}
