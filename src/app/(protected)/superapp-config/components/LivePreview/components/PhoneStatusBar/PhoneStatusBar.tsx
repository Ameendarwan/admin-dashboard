import { Battery, Signal, Wifi } from 'lucide-react';

interface PhoneStatusBarProps {
  currentTime: string;
}

export function PhoneStatusBar({ currentTime }: Readonly<PhoneStatusBarProps>) {
  return (
    <div className="flex h-[45.489px] items-center justify-center w-full px-5">
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs font-semibold text-mds-black-900">
          {currentTime}
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="bg-black h-[28.527px] rounded-full w-[96.374px]" />
      </div>

      <div className="flex-1 flex items-center justify-end gap-[6.168px]">
        <Signal className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <Battery className="w-4 h-4" />
      </div>
    </div>
  );
}
