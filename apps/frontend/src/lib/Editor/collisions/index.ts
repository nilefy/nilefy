import { editorStore } from '../Models';
import { Point } from '@/types';
import {
  BoundingRect,
  WebloomGridDimensions,
  WebloomPixelDimensions,
} from '../interface';
import {
  convertGridToPixel,
  convertPixelToGrid,
  getBoundingRect,
} from '../utils';

export function handleHoverCollision(
  dimensions: WebloomGridDimensions,
  parentPixelDims: WebloomPixelDimensions,
  overBoundingRect: BoundingRect,
  grid: [number, number],
  isCanvas: boolean,
  mousePos: Point,
  forShadow = false,
): WebloomGridDimensions {
  const nodePixelDims = convertGridToPixel(dimensions, grid, parentPixelDims);
  if (!isCanvas) {
    if (
      mousePos.y <=
      overBoundingRect.top +
        (overBoundingRect.bottom - overBoundingRect.top) / 2 -
        5
    ) {
      if (forShadow) {
        nodePixelDims.y = overBoundingRect.top - 10;
        nodePixelDims.height = 10;
      } else {
        nodePixelDims.y = overBoundingRect.top;
      }
    } else {
      nodePixelDims.y = overBoundingRect.bottom;
    }
  }
  return convertPixelToGrid(nodePixelDims, grid, parentPixelDims);
}
/**
 *
 * @param id
 * @param overId
 * @param siblings
 * @param newDimensions
 * @param mousePos
 * @description handles where the element should be dropped when collided with a node laterally
 * @returns position the element should be in after move commit
 */
export function handleLateralCollisions(
  id: string,
  overId: string,
  draggedNode: string | null,
  siblings: string[],
  newDimensions: WebloomGridDimensions,
  mousePos: Point,
): WebloomGridDimensions {
  const { columnsCount, rowsCount, col: x, row: y } = newDimensions;
  let left = x;
  let top = y;
  let colCount = columnsCount;
  for (const sibling of siblings) {
    // we don't want to check collisions with the node itself
    if (sibling === id || sibling === draggedNode) continue;
    // we don't want to check collisions with the node we are hovering over
    if (sibling === overId) continue;
    const otherNode = editorStore.currentPage.getWidgetById(sibling);
    // const otherNode = store.getState().tree[sibling];
    const otherBoundingRect = otherNode.boundingRect;
    // const otherBoundingRect = store.getState().getBoundingRect(sibling);
    const otherBottom = otherNode.row + otherNode.rowsCount;
    const otherTop = otherNode.row;
    const otherLeft = otherNode.col;
    const otherRight = otherNode.col + otherNode.columnsCount;
    const mouseLeftOfElement = mousePos.x < otherBoundingRect.left;
    const mouseRightOfElement = mousePos.x > otherBoundingRect.right;
    const mouseUnderElementOrExactlyOnBorder =
      mousePos.y >= otherBoundingRect.bottom;
    const mouseWithinElement =
      mousePos.x > otherBoundingRect.left &&
      mousePos.x < otherBoundingRect.right;
    if (top < otherBottom && top >= otherTop) {
      if (mouseWithinElement && mouseUnderElementOrExactlyOnBorder) {
        // mouse under other element and between its left and right
        top = otherBottom;
      } else if (
        mouseLeftOfElement &&
        left < otherLeft &&
        left + colCount > otherLeft
      ) {
        colCount = Math.min(colCount, otherLeft - left);
        if (colCount < 2) {
          left = otherLeft - 2;
          colCount = 2;
        }
      } else if (
        (left >= otherLeft && left < otherRight) ||
        (mouseRightOfElement && left < otherLeft)
      ) {
        const temp = left;
        left = otherRight;
        colCount += temp - left;
        if (colCount < 2) {
          colCount = 2;
        }
      }
    }
  }
  return {
    col: left,
    row: top,
    columnsCount: colCount,
    rowsCount: rowsCount,
  };
}

export function handleParentCollisions(
  dimensions: WebloomGridDimensions,
  parentDims: WebloomPixelDimensions,
  parentBoundingRect: BoundingRect,
  grid: [number, number],
  clipBottom = false,
) {
  const [gridrow, gridcol] = grid;
  const boundingRect = getBoundingRect(
    convertGridToPixel(dimensions, [gridrow, gridcol], parentDims),
  );

  //left < parentLeft
  if (boundingRect.left < parentBoundingRect.left) {
    dimensions.columnsCount =
      (boundingRect.right - parentBoundingRect.left) / gridcol;
    dimensions.col = 0;
    if (dimensions.columnsCount < 1) {
      dimensions.columnsCount = 1;
    }
  }
  //right >= parentRight
  if (boundingRect.right > parentBoundingRect.right) {
    // colCount = Math.min(colCount, parentRight - left);
    const diff = parentBoundingRect.right - boundingRect.left;
    const newColCount = Math.floor(diff / gridcol);
    dimensions.columnsCount = Math.min(dimensions.columnsCount, newColCount);
    if (dimensions.columnsCount < 1) {
      dimensions.columnsCount = 1;
    }
  }

  //top < parentTop
  if (boundingRect.top < parentBoundingRect.top) {
    dimensions.row = 0;
    dimensions.rowsCount =
      (boundingRect.bottom - parentBoundingRect.top) / gridrow;
  }
  //bottom >= parentBottom
  if (boundingRect.bottom > parentBoundingRect.bottom) {
    if (clipBottom) {
      const diff = parentBoundingRect.bottom - boundingRect.top;
      const newRowCount = Math.floor(diff / gridrow);
      dimensions.rowsCount = Math.min(dimensions.rowsCount, newRowCount);
      if (dimensions.rowsCount < 1) {
        dimensions.rowsCount = 1;
      }
    }
  }
  return dimensions;
}
