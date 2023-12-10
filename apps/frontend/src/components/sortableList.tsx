import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './sortableItem';

function SortableList<T extends { id: string | number }>({
  items,
  renderItem,
  onSortEnd,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onSortEnd: (oldItem: T, newItem: T) => void;
}) {
  const [sortedItems, setSortedItems] = useState(items);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      //   onSortEnd(active.id, over?.id);
      setSortedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        onSortEnd(items[oldIndex], items[newIndex]);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  useEffect(() => setSortedItems(items), [items]);
  return (
    <DndContext
      key={'sort-dnd-context'}
      id={'sort-dnd-context'}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems}
        strategy={verticalListSortingStrategy}
      >
        {sortedItems.map((item) => (
          <SortableItem key={item.id} id={item.id.toString()}>
            {renderItem(item)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

export { SortableList };
