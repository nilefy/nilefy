import { WidgetTypes } from '@/pages/Editor/Components';

export type DraggedItem = NewDraggedItem | ExistingDraggedItem;

export type NewDraggedItem = {
  isNew: true;
  type: WidgetTypes;
};

export type ExistingDraggedItem = {
  isNew: false;
  id: string;
};
