'use client';

import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { LinkButton } from '@merit-incentives/ui';
import { Upload } from 'lucide-react';
import { useMemo } from 'react';

import { MediaType } from '@/types/superApp';
import { useLocalization } from '@/hooks/useLocalization';

import MediaItem from '../MediaItem';
import { SortableMediaItem } from '../MediaItem/components';

interface CarouselSectionProps {
  mediaType: MediaType;
  mediaManagement: ReturnType<
    typeof import('../../../../hooks').useMediaManagement
  >;
}

export default function CarouselSection({
  mediaType,
  mediaManagement,
}: Readonly<CarouselSectionProps>) {
  const { translate } = useLocalization('media-management');

  // Dynamically get icon configs from API response
  const iconConfigs = useMemo(() => {
    return Object.entries(mediaManagement.icons)
      .map(([key, data]) => ({
        key,
        title: data.label || data.title, // Use label if present, otherwise formatted key
        dimensions: '112 x 112 px',
        requiredWidth: 112,
        requiredHeight: 112,
        position: data.position || 0,
        // Icons 7+ (position >= 7) can be deleted
        isDeletable: (data.position || 0) >= 7,
      }))
      .sort((a, b) => a.position - b.position); // Sort by position
  }, [mediaManagement.icons]);

  // Get sorted icon keys for drag and drop
  const sortedIconKeys = useMemo(() => {
    return iconConfigs.map((icon) => icon.key);
  }, [iconConfigs]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedIconKeys.indexOf(active.id as string);
    const newIndex = sortedIconKeys.indexOf(over.id as string);

    // Reorder the keys
    const newOrder = arrayMove(sortedIconKeys, oldIndex, newIndex);

    // Update positions in the media management state
    mediaManagement.updateIconPositions(newOrder);
  };

  const handleIconToggle = (key: string) => {
    mediaManagement.setExpandedItem((prev) => (prev === key ? null : key));
  };

  const handleAddIconSlot = () => {
    mediaManagement.addIconSlot();
  };

  const handleDeleteIcon = (key: string) => {
    mediaManagement.deleteIconSlot(key);
  };

  if (mediaManagement.isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mds-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center flex-1">
      <p className="text-sm font-medium text-mds-black-900">
        {translate('carouselSection.iconSlotsDescription')}
      </p>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sortedIconKeys}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3 items-start w-full overflow-y-auto">
            {iconConfigs.map((icon) => (
              <SortableMediaItem key={icon.key} id={icon.key}>
                <MediaItem
                  itemId={icon.key}
                  title={icon.title}
                  dimensions={icon.dimensions}
                  requiredWidth={icon.requiredWidth}
                  requiredHeight={icon.requiredHeight}
                  isExpanded={mediaManagement.expandedItem === icon.key}
                  onToggle={() => handleIconToggle(icon.key)}
                  mediaType={mediaType}
                  mediaManagement={mediaManagement}
                  isDeletable={icon.isDeletable}
                  onDelete={
                    icon.isDeletable
                      ? () => handleDeleteIcon(icon.key)
                      : undefined
                  }
                />
              </SortableMediaItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Icon Slot Button */}
      <LinkButton
        className="mr-auto"
        onClick={handleAddIconSlot}
        leftIcon={<Upload className="w-4 h-4" />}
      >
        {translate('carouselSection.addIconSlot')}
      </LinkButton>
    </div>
  );
}
