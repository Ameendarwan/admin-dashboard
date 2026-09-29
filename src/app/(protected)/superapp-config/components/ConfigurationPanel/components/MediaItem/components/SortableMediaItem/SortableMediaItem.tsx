import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { cloneElement, isValidElement } from 'react';

type SortableMediaItemProps = {
  id: string;
  children: React.ReactNode;
};

export default function SortableMediaItem({
  id,
  children,
}: Readonly<SortableMediaItemProps>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="w-full">
      {isValidElement(children)
        ? cloneElement(children, { dragListeners: listeners } as {
            dragListeners: DraggableSyntheticListeners | undefined;
          })
        : children}
    </div>
  );
}
