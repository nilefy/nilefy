import { useDroppable } from '@dnd-kit/core';
import { useEffect, useMemo, useRef } from 'react';
import store from '@/store';
import { ROOT_NODE_ID } from '@/lib/constants';
import { useWebloomDraggable } from '@/hooks';
import ResizeAction from '@/Actions/Editor/Resize';
import { DeleteAction } from '@/Actions/Editor/Delete';
import { commandManager } from '@/Actions/CommandManager';
import { Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

type WebloomAdapterProps = {
  id: string;
  children: React.ReactNode;
  draggable?: boolean;
  droppable?: boolean;
  resizable?: boolean;
};
const handlePositions = {
  'top-left': [0, 0],
  'top-right': [0, 1],
  'bottom-left': [1, 0],
  'bottom-right': [1, 1],
  top: [0, 0.5],
  bottom: [1, 0.5],
  left: [0.5, 0],
  right: [0.5, 1],
} as const;

const cursors = {
  'top-left': 'nwse-resize',
  'top-right': 'nesw-resize',
  'bottom-left': 'nesw-resize',
  'bottom-right': 'nwse-resize',
  top: 'ns-resize',
  bottom: 'ns-resize',
  left: 'ew-resize',
  right: 'ew-resize',
} as const;
export const WebloomAdapter = (props: WebloomAdapterProps) => {
  const { id } = props;
  const selected = store((state) => state.selectedNode) === id;
  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: id,
    disabled: !props.droppable,
  });
  const el = store().tree[id];
  //todo change to parent when nesting is implemented
  const root = store().tree[ROOT_NODE_ID];
  const ref = useRef<HTMLDivElement>(null);
  const elDimensions = store.getState().getDimensions(id);
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
          store.getState().setSelectedNode(id);
        },
      };
    return {
      ...listeners,
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        store.getState().setSelectedNode(id);
        listeners.onMouseDown(e);
      },
    };
  }, [listeners, id]);
  useEffect(() => {
    setNodeRef(ref.current);
    setDropNodeRef(ref.current);
  }, [setDropNodeRef, setNodeRef]);
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
  const handles = useMemo(() => {
    if (!props.resizable) return null;
    const handleSize = 10;
    const handleStyle: React.CSSProperties = {
      position: 'absolute',
      width: handleSize,
      height: handleSize,
      backgroundColor: 'white',
      border: '1px solid black',
      borderRadius: '50%',
    };
    return (
      !isDragging &&
      selected && (
        <div
          className="touch-none select-none"
          style={{
            position: 'absolute',
            top: style.top,
            left: style.left,
            transform: style.transform,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-25px',
              right: '-85px',
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              commandManager.executeCommand(new DeleteAction(id));
            }}
          >
            <Trash2 />
          </div>
          {Object.entries(handlePositions).map(([key, [y, x]]) => {
            const width = elDimensions.width;
            const height = elDimensions.height;
            let left = 0;
            if (x === 0) {
              left = -handleSize / 2;
            } else if (x === 1) {
              left = width - handleSize / 2;
            } else {
              left = width / 2 - handleSize / 2;
            }
            let top = 0;
            if (y === 0) {
              top = -handleSize / 2;
            } else if (y === 1) {
              top = height - handleSize / 2;
            } else {
              top = height / 2 - handleSize / 2;
            }
            return (
              <div
                key={key}
                className={`absolute touch-none ${key}`}
                style={{
                  ...handleStyle,
                  top,
                  left,
                  cursor: cursors[key as keyof typeof cursors],
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  commandManager.executeCommand(
                    ResizeAction.start(id, key as keyof typeof cursors, {
                      width: elDimensions.width,
                      height: elDimensions.height,
                      x: elDimensions.x,
                      y: elDimensions.y,
                    }),
                  );
                }}
                onPointerUp={(e) =>
                  commandManager.executeCommand(
                    ResizeAction.end({
                      x: e.clientX,
                      y: e.clientY,
                    }),
                  )
                }
              ></div>
            );
          })}
        </div>
      )
    );
  }, [props.resizable, style, elDimensions, selected, isDragging, id]);
  useEffect(() => {
    const resizeHandler = (e: MouseEvent) => {
      if (ResizeAction.resizingKey === null) return;
      e.stopPropagation();
      commandManager.executeCommand(
        ResizeAction.move({
          x: e.clientX,
          y: e.clientY,
        }),
      );
    };
    const resizeEndHandler = (e: MouseEvent) => {
      commandManager.executeCommand(
        ResizeAction.end({
          x: e.clientX,
          y: e.clientY,
        }),
      );
    };
    const rootDom = root.dom;
    const el = ref.current;
    if (rootDom === null) return;
    if (el === null) return;
    window.addEventListener('pointermove', resizeHandler);
    el.addEventListener('pointermove', resizeHandler);
    window.addEventListener('pointerup', resizeEndHandler);
    el.addEventListener('pointerup', resizeEndHandler);
    return () => {
      window.removeEventListener('pointermove', resizeHandler);
      el.removeEventListener('pointermove', resizeHandler);
      window.removeEventListener('pointerup', resizeEndHandler);
      el.removeEventListener('pointerup', resizeEndHandler);
    };
  }, [
    elDimensions.width,
    elDimensions.height,
    elDimensions.x,
    elDimensions.y,
    id,
    el,
    root.dom,
  ]);
  return (
    <>
    <ContextMenu>
  <ContextMenuTrigger> <div
        {...modListeners}
        {...attributes}
        style={style}
        ref={ref}
        className="touch-none"
      >
        {props.children}
      </div></ContextMenuTrigger>
  <ContextMenuContent>
  <ContextMenuItem  onPointerDown={(e) => {
            e.stopPropagation();
            commandManager.executeCommand(
            DeleteAction.Delete(id,parentId,node)
            );
          }}>Delete</ContextMenuItem>
     
         
  </ContextMenuContent>
</ContextMenu>

      {handles}
    </>
  );
};
