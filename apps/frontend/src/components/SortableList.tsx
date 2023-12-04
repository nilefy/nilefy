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
import { SortableItem } from './SortableItem';
import { Page } from './pageSelector';

function SortableList({
  items,
  renderItem,
  onSortEnd,
}: {
  items: Page[];
  renderItem: (item: Page) => React.ReactNode;
  onSortEnd: (oldItem: Page, newItem: Page) => void;
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
    console.log(active, over);

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
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedItems}
        strategy={verticalListSortingStrategy}
      >
        {sortedItems.map((item) => (
          <SortableItem key={item.id} id={item.id} rest={item}>
            {renderItem(item)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

export { SortableList };
