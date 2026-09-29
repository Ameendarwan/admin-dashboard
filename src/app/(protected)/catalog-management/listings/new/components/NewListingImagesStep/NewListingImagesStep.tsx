'use client';

import { Badge, toast } from '@merit-incentives/ui';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

import {
  NEW_LISTING_MAX_IMAGE_BYTES,
  validateImageFile,
} from '@/app/(protected)/catalog-management/utils/newListingFormHelpers';
import type { NewListingFormValues } from '@/types/catalog';

interface NewListingImagesStepProps {
  values: NewListingFormValues;
  onChangeSlots: (slots: NewListingFormValues['imageSlots']) => void;
  errors: Record<string, string>;
  translate: (key: string, values?: Record<string, string | number>) => string;
}

export function NewListingImagesStep({
  values,
  onChangeSlots,
  errors,
  translate,
}: Readonly<NewListingImagesStepProps>) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const targetIndexRef = useRef(0);

  const openPicker = (index: number) => {
    targetIndexRef.current = index;
    inputRef.current?.click();
  };

  const onFile = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    const code = validateImageFile(file, NEW_LISTING_MAX_IMAGE_BYTES);
    if (code === 'type') {
      toast.error(translate('images.errorType'));
      return;
    }
    if (code === 'size') {
      toast.error(
        translate('images.errorSize', {
          maxMb: Math.floor(NEW_LISTING_MAX_IMAGE_BYTES / (1024 * 1024)),
        }),
      );
      return;
    }

    const idx = targetIndexRef.current;
    const next = values.imageSlots.map((slot, i) => {
      if (i !== idx) {
        return slot;
      }
      if (slot.previewUrl) {
        URL.revokeObjectURL(slot.previewUrl);
      }
      return {
        ...slot,
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
    onChangeSlots(next);
  };

  return (
    <div className="space-y-8">
      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg"
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files);
          e.target.value = '';
        }}
      />

      <div>
        <h2 className="text-2xl font-semibold leading-tight tracking-tight text-mds-black-900">
          {translate('images.sectionTitle')}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-mds-black-600">
          {translate('images.sectionSubtitle')}
        </p>
        {errors.images ? (
          <p className="mt-2 text-sm text-red-500">
            {translate('errors.imagesMin')}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {values.imageSlots.map((slot, index) => (
          <div key={slot.id} className="min-w-0">
            <div className="relative mx-auto h-[238px] w-full max-w-[279px]">
              {index === 0 ? (
                <Badge
                  color="primary"
                  className="absolute end-2 top-2 z-10 rounded-full border-0 bg-mds-primary-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm"
                >
                  {translate('images.mainBadge')}
                </Badge>
              ) : null}
              <button
                type="button"
                onClick={() => openPicker(index)}
                className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-mds-primary-400 bg-[#F4F7FF] p-4 text-center transition-colors hover:border-mds-primary-500 hover:brightness-[0.98]"
              >
                {slot.previewUrl ? (
                  <div className="relative h-full min-h-0 w-full overflow-hidden rounded-lg bg-white ring-1 ring-mds-black-100">
                    <Image
                      src={slot.previewUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-mds-black-100">
                      <Plus
                        className="h-6 w-6 text-mds-primary-600"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </div>
                    <p className="px-1 text-[11px] leading-snug text-mds-black-600">
                      {translate('images.dropHint')}
                    </p>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
