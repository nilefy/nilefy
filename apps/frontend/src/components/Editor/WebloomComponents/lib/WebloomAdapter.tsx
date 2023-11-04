import { useDroppable } from '@dnd-kit/core';
import { useEffect, useMemo, useRef } from 'react';
import store from '@/store';
import { ROOT_NODE_ID } from '@/lib/constants';
import { useWebloomDraggable } from '@/hooks';
import ResizeAction from '@/Actions/Editor/Resize';
import { commandManager } from '@/Actions/CommandManager';

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
  const elDimensions = store((store) => store.getRelativeDimensions(id));
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
          store.getState().setSelectedNodeIds((prev) => {
            if (id === ROOT_NODE_ID) {
              return new Set();
            } else if (e.shiftKey && prev.has(id)) {
              return new Set([...prev].filter((i) => i !== id));
            } else if (e.shiftKey) {
              return new Set([...prev, id]);
            } else {
              return new Set([id]);
            }
          });
        },
      };
    return {
      ...listeners,
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        store.getState().setSelectedNodeIds((prev) => {
          if (id === ROOT_NODE_ID) {
            return new Set();
          } else if (e.shiftKey && prev.has(id)) {
            return new Set([...prev].filter((i) => i !== id));
          } else if (e.shiftKey) {
            return new Set([...prev, id]);
          } else {
            return new Set([id]);
          }
        });
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
        {props.children}
      </div>
    </>
  );
};
