'use client';

import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
import { Badge, Button } from '@merit-incentives/ui';
import { DraggableSyntheticListeners } from '@dnd-kit/core';

import { MEDIA_TYPES } from '@/app/(protected)/superapp-config/constants';
import { MediaItemHeaderProps } from '@/types/superApp';
import { useLocalization } from '@/hooks/useLocalization';

export default function MediaItemHeader({
  title,
  dimensions,
  isExpanded,
  mediaType,
  onToggle,
  dragListeners,
  isDeletable = false,
  onDelete,
  status,
  fileModified,
}: Readonly<
  MediaItemHeaderProps & {
    dragListeners?: DraggableSyntheticListeners;
    isDeletable?: boolean;
    onDelete?: () => void;
    hasExistingImage?: boolean;
    status?: 'published' | 'expired' | null;
    fileModified?: boolean;
  }
>) {
  const { translate } = useLocalization('media-management');

  const getBadgeText = () => {
    if (fileModified) {
      return translate('mediaItemHeader.imageUploaded');
    }
    if (status === 'published') {
      return translate('mediaItemHeader.published');
    }
    return null;
  };

  const shouldShowBadge =
    !isExpanded && (status === 'published' || fileModified);
  const badgeText = getBadgeText();

  return (
    <Button
      onClick={onToggle}
      className="flex items-center justify-between w-full bg-transparent! border-none! p-0! hover:bg-transparent! min-w-0! [&>*:first-child]:w-full"
    >
      <div className="flex gap-0 items-start justify-between">
        <div className="flex gap-3">
          {mediaType === MEDIA_TYPES['carousel-icons'] && (
            <div className="flex self-center cursor-grab" {...dragListeners}>
              <GripVertical className="text-mds-black-500" />
            </div>
          )}

          <div className="flex flex-col gap-1 items-start flex-1">
            <div className="flex gap-2 items-start">
              <p className="font-medium leading-[1.2] text-[18px] text-mds-black-900">
                {title}
              </p>
              {shouldShowBadge && badgeText && (
                <div className="flex items-start">
                  <Badge color="success" size="sm">
                    {badgeText}
                  </Badge>
                </div>
              )}
            </div>
            <p className="font-medium leading-[1.4] text-[14px] text-mds-black-500">
              {dimensions}
            </p>
          </div>
        </div>
        <div className="self-center flex ml-auto items-center justify-center gap-2 min-h-10">
          {mediaType === MEDIA_TYPES['carousel-icons'] &&
            isDeletable &&
            onDelete && (
              <Trash2
                className="w-6 h-6 text-mds-error-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              />
            )}
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-mds-primary-700" />
          ) : (
            <ChevronDown className="w-6 h-6 text-mds-black-900" />
          )}
        </div>
      </div>
    </Button>
  );
}
