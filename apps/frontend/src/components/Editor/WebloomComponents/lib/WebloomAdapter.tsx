import { useDroppable } from '@dnd-kit/core';
import { useEffect, useMemo, useRef } from 'react';
import store from '@/store';
import { ROOT_NODE_ID } from '@/lib/constants';
import { useWebloomDraggable } from '@/hooks';
import ResizeAction from '@/Actions/Editor/Resize';
import { commandManager } from '@/Actions/CommandManager';
import { SelectionAction } from '@/Actions/Editor/selection';

type WebloomAdapterProps = {
  id: string;
  children: React.ReactNode;
  draggable?: boolean;
  droppable?: boolean;
  resizable?: boolean;
};

export const WebloomAdapter = (props: WebloomAdapterProps) => {
  const { id } = props;
  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: id,
    disabled: !props.droppable,
  });
  const ref = useRef<HTMLDivElement>(null);
  const elDimensions = store((store) => store.getRelativePixelDimensions(id));
  const { attributes, listeners, setNodeRef, isDragging } = useWebloomDraggable(
    {
      id,
      disabled: !props.draggable && ResizeAction.resizingKey === null,
      data: {
        isNew: false,
      },
    },
  );
  const modListeners = useMemo(() => {
    if (!listeners)
      return {
        onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          commandManager.executeCommand(new SelectionAction(id, e.shiftKey));
        },
      };
    return {
      ...listeners,
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        commandManager.executeCommand(new SelectionAction(id, e.shiftKey));
        listeners.onMouseDown(e);
      },
    };
  }, [listeners, id]);
  useEffect(() => {
    props.draggable && setNodeRef(ref.current);
    props.droppable && setDropNodeRef(ref.current);
  }, [setDropNodeRef, setNodeRef, props.draggable, props.droppable]);
  const style = useMemo(() => {
    return {
      top: elDimensions.y,
      left: elDimensions.x,
      position: 'absolute',
      width: elDimensions.width,
      height: elDimensions.height,
      visibility: isDragging ? 'hidden' : 'visible',
      opacity: isDragging ? 0 : 1,
    } as React.CSSProperties;
  }, [
    elDimensions.x,
    elDimensions.y,
    elDimensions.width,
    elDimensions.height,
    isDragging,
  ]);

  return (
    <>
      <div
        {...modListeners}
        {...attributes}
        style={style}
        ref={ref}
        className="target touch-none"
        data-id={id}
      >
        {!isDragging && props.children}
      </div>
    </>
  );
};
