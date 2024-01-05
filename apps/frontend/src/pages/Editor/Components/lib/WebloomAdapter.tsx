import { useDroppable } from '@dnd-kit/core';
import { useEffect, useMemo, useRef } from 'react';
import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { useWebloomDraggable } from '@/hooks';

import { EDITOR_CONSTANTS } from '@webloom/constants';

import { commandManager } from '@/Actions/CommandManager';
import { SelectionAction } from '@/Actions/Editor/selection';
import { cn } from '@/lib/cn';
import { observer } from 'mobx-react-lite';
// import { useShallow } from 'zustand/react/shallow';

type WebloomAdapterProps = {
  id: string;
  children: React.ReactNode;
  draggable?: boolean;
  droppable?: boolean;
  resizable?: boolean;
};

export const WebloomAdapter = observer((props: WebloomAdapterProps) => {
  const { id } = props;
  const isResizing = editorStore.currentPage.resizedWidgetId === id;
  // const isResizing = store((state) => state.resizedNode === id);
  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: id,
    disabled: !props.droppable,
  });
  const ref = useRef<HTMLDivElement>(null);
  const { x, y, width, height } =
    editorStore.currentPage.getWidgetById(id).relativePixelDimensions;
  console.log('elDimensions69', x, y, width, height);
  // const elDimensions = store(
  //   useShallow((store) => store.getRelativePixelDimensions(id)),
  // );
  const { attributes, listeners, setNodeRef, isDragging, active } =
    useWebloomDraggable({
      id,
      disabled: !props.draggable,
      data: {
        isNew: false,
      },
    });
  if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
    attributes.role = 'canvas';
  }
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
      top: y,
      left: x,
      position: 'absolute',
      width: width,
      height: height,
    } as React.CSSProperties;
  }, [x, y, width, height]);
  if (id === EDITOR_CONSTANTS.ROOT_NODE_ID) {
    return (
      <div
        {...modListeners}
        {...attributes}
        style={style}
        ref={ref}
        className="target relative touch-none overflow-hidden outline-none"
        data-id={id}
      >
        {props.children}
      </div>
    );
  }
  return (
    <div
      key={'adapter' + id}
      {...modListeners}
      {...attributes}
      style={style}
      ref={ref}
      className="target relative touch-none overflow-hidden outline-none"
      data-id={id}
    >
      {
        //this is to prevent widgets from capturing focus when drag is happening
        !!active && (
          <div className="absolute left-0 top-0 z-10 h-full w-full"></div>
        )
      }
      <div
        key={id}
        className={cn(
          {
            hidden: isDragging || isResizing,
          },
          {
            flex: !isDragging && !isResizing,
          },
          'w-full h-full',
        )}
      >
        {props.children}
      </div>
    </div>
  );
});
