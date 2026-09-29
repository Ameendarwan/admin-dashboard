import { type ReactNode } from 'react';

import { PhoneStatusBar } from '../PhoneStatusBar';
import { ShopNavBar } from '../ShopNavBar';

interface PhoneFrameProps {
  currentTime: string;
  children: ReactNode;
}

export function PhoneFrame({
  currentTime,
  children,
}: Readonly<PhoneFrameProps>) {
  return (
    <div className="bg-white border-2 border-mds-black-200 h-164.25 overflow-clip relative rounded-[30.84px] w-75.75">
      <div className="absolute inset-0 bg-mds-gray-100" />

      <div className="absolute left-0 right-0 top-0 bg-white/90 z-10">
        <PhoneStatusBar currentTime={currentTime} />
        <ShopNavBar />
      </div>

      <div className="absolute bg-mds-bg-light-50 top-23.5 left-0 right-0 bottom-0 overflow-y-auto px-4 pb-6 scrollbar-hide">
        {children}
      </div>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black rounded-full" />
    </div>
  );
}
