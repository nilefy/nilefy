import ResizeAction, { ResizingKeys } from '@/actions/editor/Resize';
import { commandManager } from '@/actions/CommandManager';
import { editorStore } from '@/lib/Editor/Models';
import { useCallback, useMemo } from 'react';

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
const borderStyles: {
  [key in keyof typeof mainDirectionPositions]: string;
} = {
  top: 'after:absolute after:w-[16px] after:h-[7px] after:border after:rounded-full after:z-10 after:bg-white after:top-[calc(50%-2.5px)] after:left-[calc(50%-8px)] after:border-solid after:border-[1px] after:border-[#a9c0ff] after:outline-solid after:outline-white after:outline-[1px] absolute h-[12px] left-[-4px] w-[calc(100%+8px)] cursor-row-resize top-[-8.5px] before:absolute before:top-1/2 before:right-0 before:left-0 before:h-[1px] before:absolute before:content-[""] ',
  bottom:
    'after:absolute after:w-[16px] after:h-[7px] after:border after:rounded-full after:z-10 after:bg-white after:top-[calc(50%-2.5px)] after:left-[calc(50%-8px)] after:border-solid after:border-[1px] after:border-[#a9c0ff] after:outline-solid after:outline-white after:outline-[1px] absolute h-[12px] left-[-4px] w-[calc(100%+8px)] cursor-row-resize bottom-[-6.5px] before:absolute before:top-1/2 before:right-0 before:left-0 before:h-[1px] before:absolute before:content-[""] ',
  left: 'after:absolute after:w-[7px] after:h-[16px] after:border after:rounded-full after:z-10 after:bg-white after:top-[calc(50%-8px)] after:left-[calc(50%-2.5px)] after:border-solid after:border-[1px] after:border-[#a9c0ff] after:outline-solid after:outline-white after:outline-[1px] absolute w-[12px] top-[-3px] h-[calc(100%+7px)] cursor-col-resize left-[-8.5px] before:absolute before:left-1/2 before:bottom-0 before:top-0 before:w-[1px] before:absolute before:content-[""] ',
  right:
    'after:absolute after:w-[7px] after:h-[16px] after:border after:rounded-full after:z-10 after:bg-white after:top-[calc(50%-8px)] after:left-[calc(50%-2.5px)] after:border-solid after:border-[1px] after:border-[#a9c0ff] after:outline-solid after:outline-white after:outline-[1px] absolute w-[12px] top-[-3px] h-[calc(100%+7px)] cursor-col-resize right-[-6.5px] before:absolute before:left-1/2 before:bottom-0 before:top-0 before:w-[1px] before:absolute before:content-[""]',
};
const cornerStyles: {
  [key in keyof typeof cornerPositions]: string;
} = {
  'bottom-left':
    'absolute w-[10px] h-[10px] left-[-5px] bottom-[-5px] cursor-sw-resize',
  'bottom-right':
    'absolute w-[10px] h-[10px] right-[-5px] bottom-[-5px] cursor-se-resize',
  'top-left':
    'absolute w-[10px] h-[10px] left-[-5px] top-[-5px] cursor-nw-resize',
  'top-right':
    'absolute w-[10px] h-[10px] right-[-5px] top-[-5px] cursor-ne-resize',
};

const isMainDirection = (
  key: string,
): key is keyof typeof mainDirectionPositions => {
  return key in mainDirectionPositions;
};
const handlePositions = {
  ...cornerPositions,
  ...mainDirectionPositions,
} as const;

export const ResizeHandles = observer(function Handles({ id }: { id: string }) {
  const widget = editorStore.currentPage.getWidgetById(id);
  const direction = widget.resizeDirection;
  const allowedResizingHandles = useMemo(() => {
    if (direction === 'Both') {
      return Object.keys(handlePositions);
    }
    if (direction === 'Horizontal') {
      return ['left', 'right'];
    }

    return ['top', 'bottom'];
  }, [direction]);

  const isDragging = widget.isDragging;
  const isSelected = widget.isSelected;
  const isHovered = widget.isHovered;
  const isVisible = !isDragging && (isSelected || isHovered);
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, key: ResizingKeys) => {
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
    },
    [id, widget],
  );
  const handleResizeMouseUp = useCallback((e: React.MouseEvent) => {
    commandManager.executeCommand(
      ResizeAction.end({
        x: e.clientX,
        y: e.clientY,
      }),
    );
  }, []);
  return (
    isVisible && (
      <>
        {allowedResizingHandles
          .filter((key) => isMainDirection(key))
          .map((key) => {
            return (
              <div
                key={key}
                id={'RESIZE_HANDLER' + widget.id + key}
                className={borderStyles[key]}
                onMouseDown={(e) => {
                  handleResizeMouseDown(e, key);
                }}
                onMouseUp={handleResizeMouseUp}
              ></div>
            );
          })}
        {allowedResizingHandles
          .filter((key) => !isMainDirection(key))
          .map((key) => {
            return (
              <div
                key={key}
                id={'RESIZE_HANDLER' + widget.id + key}
                className={cornerStyles[key as keyof typeof cornerStyles]}
                onMouseDown={(e) => {
                  handleResizeMouseDown(e, key as ResizingKeys);
                }}
                onMouseUp={handleResizeMouseUp}
              ></div>
            );
          })}
      </>
    )
  );
});
