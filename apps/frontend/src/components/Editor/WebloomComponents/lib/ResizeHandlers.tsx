import { commandManager } from '@/Actions/CommandManager';
import ResizeAction from '@/Actions/Editor/Resize';
import store from '@/store';
import { useEffect } from 'react';
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
export function ResizeHandlers() {
  const selectedIds = store((state) => state.selectedNodeIds);
  const selectedIdsArray = Array.from(selectedIds);
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

    window.addEventListener('pointermove', resizeHandler);
    window.addEventListener('pointerup', resizeEndHandler);
    return () => {
      window.removeEventListener('pointermove', resizeHandler);
      window.removeEventListener('pointerup', resizeEndHandler);
    };
  }, []);
  return (
    <>
      {selectedIdsArray.map((id) => (
        <Handles key={id} id={id} />
      ))}
    </>
  );
}

function Handles({ id }: { id: string }) {
  const dims = store((state) => state.getDimensions(id));
  const isDragging = store((state) => state.draggedNode === id);
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
    !isDragging && (
      <div
        className="touch-none select-none"
        style={{
          position: 'absolute',
          top: dims.y,
          left: dims.x,
        }}
      >
        {Object.entries(handlePositions).map(([key, [y, x]]) => {
          const width = dims.width;
          const height = dims.height;
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
                    width: dims.width,
                    height: dims.height,
                    x: dims.x,
                    y: dims.y,
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
}