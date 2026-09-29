'use client';

export function StorefrontEmptyIllustration() {
  return (
    <div
      className="relative mx-auto flex h-[140px] w-[140px] items-center justify-center rounded-full bg-mds-primary-100"
      aria-hidden
    >
      <div className="relative h-[72px] w-[88px]">
        <div className="absolute bottom-2 start-5 h-[52px] w-[62px] rotate-[-6deg] rounded-lg bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)] ring-1 ring-mds-black-100">
          <div className="space-y-1.5 px-3 pt-3">
            <div className="h-1.5 w-8 rounded-full bg-mds-primary-600" />
            <div className="h-1 w-14 rounded-full bg-mds-primary-200" />
          </div>
        </div>
        <div className="absolute bottom-0 start-0 h-[56px] w-[58px] rotate-[8deg] rounded-lg bg-white shadow-[0_4px_14px_rgba(15,23,42,0.12)] ring-1 ring-mds-black-100">
          <div className="space-y-1.5 px-3 pt-3">
            <div className="h-1.5 w-10 rounded-full bg-mds-primary-500/90" />
            <div className="h-1 w-16 rounded-full bg-mds-primary-300/90" />
            <div className="h-1 w-10 rounded-full bg-mds-black-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
