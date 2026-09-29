'use client';

import { PlusCircle, X } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

export interface VariantImageSlotProps {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  selectAriaLabel: string;
  removeAriaLabel: string;
}

export function VariantImageSlot({
  previewUrl,
  onSelect,
  onRemove,
  selectAriaLabel,
  removeAriaLabel,
}: Readonly<VariantImageSlotProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelect(file);
    }
    e.target.value = '';
  };

  return (
    <div className="relative size-[100px] shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={selectAriaLabel}
        className={`flex size-full items-center justify-center rounded-xl border border-dashed transition-colors ${
          previewUrl
            ? 'border-mds-primary-300 bg-mds-primary-50'
            : 'border-mds-black-200 bg-white hover:bg-mds-bg-light-50'
        }`}
      >
        {previewUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-xl">
            <Image
              src={previewUrl}
              alt=""
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
            <PlusCircle
              size={16}
              className="text-mds-primary-600"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        )}
      </button>

      {previewUrl ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeAriaLabel}
          className="absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-mds-error-500 transition-colors hover:bg-mds-error-600"
        >
          <X size={10} className="text-white" aria-hidden />
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
