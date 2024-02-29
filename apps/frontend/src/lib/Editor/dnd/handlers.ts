import { DropTargetMonitor } from 'react-dnd';
import { DraggedItem } from './interface';
import { editorStore } from '../Models';
import {
  convertGridToPixel,
  convertPixelToGrid,
  getMousePositionRelativeToEditor,
  normalize,
} from '../utils';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { Point } from '@/types';
import { WebloomGridDimensions, WebloomPixelDimensions } from '../interface';
import { WebloomWidgets } from '@/pages/Editor/Components';
import { getNewWidgetName } from '../widgetName';
import { WebloomWidget } from '../Models/widget';
import {
  handleHoverCollision,
  handleLateralCollisions,
  handleParentCollisions,
} from '../collisions';
import { commandManager } from '@/Actions/CommandManager';
import DragAction from '@/Actions/Editor/Drag';
function snapCenterToCursor({
  currentMousePos,
  position,
}: {
  currentMousePos: Point;
  position: WebloomPixelDimensions;
}): WebloomPixelDimensions {
  const centerX = position.x + position.width / 2;
  const centerY = position.y + position.height / 2;
  const deltaX = currentMousePos.x - centerX;
  const deltaY = currentMousePos.y - centerY;
  return {
    x: position.x + deltaX,
    y: position.y + deltaY,
    width: position.width,
    height: position.height,
  };
}
export const handleDrop = (
  item: DraggedItem,
  monitor: DropTargetMonitor<unknown, unknown>,
  overId: string,
) => {
  if (overId === editorStore.currentPage.draggedWidgetId) return;

  if (monitor.didDrop()) return;

  const droppableId = getFirstDroppableParent(overId);
  const droppable = editorStore.currentPage.getWidgetById(droppableId);
  if (!droppable.dom) return;

  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return;
  const { grid } = getDropPosition(
    clientOffset,
    item,
    [EDITOR_CONSTANTS.ROW_HEIGHT, droppable.columnWidth],
    editorStore.currentPage.rootWidget.selfGridSize,
    droppable.dom.getBoundingClientRect(),
    item.isNew
      ? undefined
      : editorStore.currentPage.getWidgetById(item.id).pixelDimensions,
  );
  const newMousePos = getMousePositionRelativeToEditor(clientOffset);
  const dimensions = getDropPositionWithCollisions(
    grid,
    newMousePos,
    item.isNew ? getNewWidgetName(item.type) : item.id,
    overId,
    droppableId,
    editorStore.currentPage.draggedWidgetId!,
    false,
  );
  commandManager.executeCommand(
    new DragAction({
      draggedItem: item,
      endPosition: dimensions,
      parentId: droppableId,
    }),
  );
  editorStore.currentPage.setShadowElement(null);
};

export const handleHover = (
  item: DraggedItem,
  monitor: DropTargetMonitor<unknown, unknown>,
  overId: string,
) => {
  if (overId === editorStore.currentPage.draggedWidgetId) return;
  if (!monitor.isOver({ shallow: true })) return;
  if (editorStore.currentPage.draggedWidgetId === null) {
    if (item.isNew) {
      editorStore.currentPage.setDraggedWidgetId(getNewWidgetName(item.type));
    } else editorStore.currentPage.setDraggedWidgetId(item.id);
  }
  const droppableId = getFirstDroppableParent(overId);
  const droppable = editorStore.currentPage.getWidgetById(droppableId);
  if (!droppable.dom) return;
  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return;
  const { grid } = getDropPosition(
    clientOffset,
    item,
    [EDITOR_CONSTANTS.ROW_HEIGHT, droppable.columnWidth],
    editorStore.currentPage.rootWidget.selfGridSize,
    droppable.dom.getBoundingClientRect(),
    item.isNew
      ? undefined
      : editorStore.currentPage.getWidgetById(item.id).pixelDimensions,
  );
  const newMousePos = getMousePositionRelativeToEditor(clientOffset);
  const dimensions = getDropPositionWithCollisions(
    grid,
    newMousePos,
    item.isNew ? getNewWidgetName(item.type) : item.id,
    overId,
    droppableId,
    editorStore.currentPage.draggedWidgetId!,
    true,
  );
  const pixel = convertGridToPixel(
    dimensions,
    [EDITOR_CONSTANTS.ROW_HEIGHT, droppable.columnWidth],
    {
      x: droppable.dom.getBoundingClientRect().x,
      y: droppable.dom.getBoundingClientRect().y,
    },
  );
  editorStore.currentPage.setShadowElement(pixel);
};

export const getDropPosition = (
  mousePosition: Point,
  item: DraggedItem,
  overWidgetGridSize: WebloomWidget['gridSize'],
  rootGridSize: WebloomWidget['gridSize'],
  overWidgetBoundingRect: DOMRect,
  existingWidgetPixelDimensions?: WebloomPixelDimensions,
) => {
  let width: number;
  let height: number;
  if (item.isNew) {
    const widgetType = item.type;
    const widgetConfig = WebloomWidgets[widgetType].config;
    const [rowHeight, columnWidth] = rootGridSize;
    const [rowHeightOver, columnWidthOver] = overWidgetGridSize;
    width = normalize(
      widgetConfig.layoutConfig.colsCount * columnWidth,
      columnWidthOver,
    );
    height = normalize(
      widgetConfig.layoutConfig.rowsCount * rowHeight,
      rowHeightOver,
    );
  } else {
    const [rowHeight, columnWidth] = overWidgetGridSize;
    width = normalize(existingWidgetPixelDimensions!.width, columnWidth);
    height = normalize(existingWidgetPixelDimensions!.height, rowHeight);
  }
  const positionInsideEditorInPixels = snapCenterToCursor({
    position: {
      x: mousePosition.x - overWidgetBoundingRect.left,
      y: mousePosition.y - overWidgetBoundingRect.top,
      width,
      height,
    },
    currentMousePos: mousePosition,
  });
  const normalizedGrid = convertPixelToGrid(
    positionInsideEditorInPixels,
    overWidgetGridSize,
    { x: overWidgetBoundingRect.x, y: overWidgetBoundingRect.y },
  );
  const normalizedPixel = convertGridToPixel(
    normalizedGrid,
    overWidgetGridSize,
    { x: overWidgetBoundingRect.x, y: overWidgetBoundingRect.y },
  );
  return {
    grid: normalizedGrid,
    pixel: normalizedPixel,
  };
};

const getFirstDroppableParent = (overId: string) => {
  const overWidget = editorStore.currentPage.getWidgetById(overId);
  if (overWidget.isCanvas) return overId;
  return overWidget.canvasParent.id;
};

const getDropPositionWithCollisions = (
  gridPosition: Omit<WebloomGridDimensions, 'columnWidth'>,
  mousePos: Point,
  id: string,
  overId: string,
  parentId: string,
  draggedId: string,
  forShadow = false,
) => {
  const overEl = editorStore.currentPage.getWidgetById(overId);
  const parent = editorStore.currentPage.getWidgetById(parentId);
  const [gridrow, gridcol] = parent.selfGridSize;
  let dimensions = {
    ...gridPosition,
  };
  let shouldHandleLateralCollisions = true;
  if (overId !== EDITOR_CONSTANTS.ROOT_NODE_ID && overId !== draggedId) {
    const {
      dims,
      shouldHandleLateralCollisions: _shouldHandleLateralCollisions,
    } = handleHoverCollision(
      dimensions,
      parent.pixelDimensions,
      overEl.boundingRect,
      [gridrow, gridcol],
      !!overEl.isCanvas,
      mousePos,
      forShadow,
    );
    dimensions = dims;
    shouldHandleLateralCollisions = _shouldHandleLateralCollisions;
  }
  if (shouldHandleLateralCollisions) {
    dimensions = handleLateralCollisions(
      id,
      overId,
      draggedId,
      parent.nodes,
      dimensions,
      mousePos,
    );
  }
  dimensions = handleParentCollisions(
    dimensions,
    parent.innerContainerPixelDimensions,
    [gridrow, gridcol],
    forShadow,
  );
  dimensions.columnsCount = Math.min(
    EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
    dimensions.columnsCount,
  );
  dimensions.rowsCount = Math.min(parent.rowsCount, dimensions.rowsCount);
  return dimensions;
};
