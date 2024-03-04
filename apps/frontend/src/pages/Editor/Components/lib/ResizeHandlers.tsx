import ResizeAction from '@/Actions/Editor/Resize';
import { commandManager } from '@/Actions/CommandManager';
import { editorStore } from '@/lib/Editor/Models';
import { CSSProperties, useCallback, useMemo } from 'react';

import { WebloomWidgets } from '..';
import { observer } from 'mobx-react-lite';

const cornerPositions = {
  'top-left': [0, 0],
  'top-right': [0, 1],
  'bottom-left': [1, 0],
  'bottom-right': [1, 1],
} as const;
const mainDirectionPositions = {
  top: [0, 0.5],
  bottom: [1, 0.5],
  left: [0.5, 0],
  right: [0.5, 1],
} as const;
const isMainDirection = (
  key: string,
): key is keyof typeof mainDirectionPositions => {
  return key in mainDirectionPositions;
};
const handlePositions = {
  ...cornerPositions,
  ...mainDirectionPositions,
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
export const ResizeHandles = observer(function Handles({ id }: { id: string }) {
  const widget = editorStore.currentPage.getWidgetById(id);
  const dims = widget.relativePixelDimensions;
  const direction = WebloomWidgets[widget.type].config.resizingDirection;
  const allowedResizingHandles = useMemo(() => {
    if (direction === 'Both') {
      return Object.keys(handlePositions);
    }
    if (direction === 'Horizontal') {
      return ['left', 'right'];
    }

    return ['top', 'bottom'];
  }, [direction]);
  const resizeHandlesPoints = useMemo(
    () =>
      allowedResizingHandles.map((key) => {
        const typedKey = key as keyof typeof handlePositions;
        return [typedKey, handlePositions[typedKey]] as const;
      }),
    [allowedResizingHandles],
  );
  const isDragging = widget.isDragging;
  const isSelected = widget.isSelected;
  const isHovered = widget.isHovered;
  const isVisible = !isDragging && (isSelected || isHovered);

  const padding = 2;
  const ResizeHandlePoints = useCallback(() => {
    const handleSize = 8;
    const handleCornerStyles: CSSProperties = {
      position: 'absolute',
      width: handleSize,
      height: handleSize,
      borderRadius: '50%',
      zIndex: 50,
    };
    return resizeHandlesPoints.map(([key, [y, x]]) => {
      const width = dims.width;
      const height = dims.height;
      let left = 0;
      if (x === 0) {
        left = -handleSize / 2 - padding;
      } else if (x === 1) {
        left = width - handleSize / 2 + padding;
      } else {
        left = width / 2 - handleSize / 2;
      }
      let top = 0;
      if (y === 0) {
        top = -handleSize / 2 - padding;
      } else if (y === 1) {
        top = height - handleSize / 2 + padding;
      } else {
        top = height / 2 - handleSize / 2;
      }
      // const mainDirection = isMainDirection(key);
      return (
        <div
          key={key}
          className={`absolute touch-none ${key}`}
          style={{
            ...handleCornerStyles,
            top,
            left,
            cursor: cursors[key],
            backgroundColor: 'white',
            border: `4px solid white`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const dims = widget.pixelDimensions;
            commandManager.executeCommand(
              ResizeAction.start(id, key, {
                width: dims.width,
                height: dims.height,
                x: dims.x,
                y: dims.y,
              }),
            );
          }}
          onMouseUp={(e) =>
            commandManager.executeCommand(
              ResizeAction.end({
                x: e.clientX,
                y: e.clientY,
              }),
            )
          }
        ></div>
      );
    });
  }, [
    resizeHandlesPoints,
    widget.pixelDimensions,
    id,
    dims.width,
    dims.height,
  ]);

  // const ResizeHandleBorders = useCallback(() => {
  //   const className =
  //     "absolute w-[calc(100% + 8px)] h-[12px] top-[-8.5] left[-4px] before:content-[''] before:absolute before:h-[1px] before:left-0 before:right-0 before:top-1/2 before:bg-blue-500 ";
  // }, [allowedResizingHandles]);
  return (
    isVisible && (
      <div className="absolute bg-transparent">
        <ResizeHandlePoints />
      </div>
    )
  );
});
