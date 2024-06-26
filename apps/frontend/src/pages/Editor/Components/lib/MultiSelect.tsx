import { editorStore } from '@/lib/Editor/Models';
import Selecto, { SelectoEvents } from 'react-selecto';
import { observer } from 'mobx-react-lite';

import { CSSProperties, useCallback, useMemo, useRef, useState } from 'react';
import {
  checkOverlap,
  getMousePositionRelativeToEditor,
} from '@/lib/Editor/utils';
import { throttle } from 'lodash';
import { BoundingRect } from '@/lib/Editor/interface';
import { useAutoRun } from '@/lib/Editor/hooks';
// TODO: Custom implementation since we're tearing selecto's api for our use case
const clipDimsToBoundingRect = (
  dims: { top: number; left: number; width: number; height: number },
  boundingRect: BoundingRect,
) => {
  if (!boundingRect) return dims;
  const { top, left, right, bottom } = boundingRect;
  const newDims = { ...dims };
  if (dims.top < top) {
    newDims.height -= top - dims.top;
    newDims.top = top;
  }
  if (dims.left < left) {
    newDims.width -= left - dims.left;
    newDims.left = left;
  }
  if (dims.top + dims.height > bottom) {
    newDims.height = bottom - dims.top;
  }
  if (dims.left + dims.width > right) {
    newDims.width = right - dims.left;
  }
  return newDims;
};
const selectWidgetsInArea = (area: {
  top: number;
  left: number;
  width: number;
  height: number;
}) => {
  const areaBoundingRect = {
    top: area.top,
    left: area.left,
    right: area.left + area.width,
    bottom: area.top + area.height,
  };
  const rootWidgetChildren = editorStore.currentPage.rootWidget.nodes;
  const overlapped: string[] = [];
  rootWidgetChildren.forEach((widgetId) => {
    const widget = editorStore.currentPage.getWidgetById(widgetId);
    if (widget.type === 'NilefyModal') return;
    const widgetBoundingRect = widget.boundingRect;
    if (checkOverlap(areaBoundingRect, widgetBoundingRect))
      overlapped.push(widgetId);
  });
  editorStore.currentPage.setSelectedNodeIds(new Set(overlapped));
};
const throttledSelectWidgetsInArea = throttle(selectWidgetsInArea, 100);
const MultiSelect = observer(() => {
  const selectoRef = useRef<Selecto>(null);

  const prevContainerScrollTop = useRef(0);
  const startScrollTop = useRef(0);
  const startPosition = useRef({ x: 0, y: 0 });
  const [selectAreaDims, setSelectAreaDims] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const onDragStartHandler = useCallback((e: SelectoEvents['dragStart']) => {
    const scrollableContainer =
      editorStore.currentPage.rootWidget.scrollableContainer;
    const scrollTop = scrollableContainer?.scrollTop || 0;
    const position = getMousePositionRelativeToEditor({
      x: e.clientX,
      y: e.clientY,
    });
    prevContainerScrollTop.current = scrollTop;
    startScrollTop.current = scrollTop;
    startPosition.current = position;
    setSelectAreaDims({
      top: position.y,
      left: position.x,
      width: 0,
      height: 0,
    });
  }, []);

  const onDragHandler = useCallback((e: SelectoEvents['drag']) => {
    const { rect, distX } = e;
    const scrollableContainer =
      editorStore.currentPage.rootWidget.scrollableContainer;
    const scrollTop = scrollableContainer?.scrollTop || 0;
    const position = getMousePositionRelativeToEditor({
      x: e.clientX,
      y: e.clientY,
    });

    const currentY = position.y;
    const startAndDraggingDiff = currentY - startPosition.current.y;
    const dir = scrollTop - startScrollTop.current > 0 ? 1 : -1;
    const diff = scrollTop - startScrollTop.current!;
    const currentHeight =
      Math.abs(currentY - startPosition.current.y) + (dir === -1 ? -diff : 0);

    let currentXOrigin = startPosition.current.x;
    let currentYOrigin = startPosition.current.y;
    if (distX < 0) {
      currentXOrigin += distX;
    }
    if (startAndDraggingDiff < 0) {
      currentYOrigin = currentY;
    }

    const currentSelectAreaDims = clipDimsToBoundingRect(
      {
        top: currentYOrigin,
        left: currentXOrigin,
        width: rect.width,
        height: currentHeight,
      },
      editorStore.currentPage.rootWidget.boundingRect,
    );

    setSelectAreaDims(currentSelectAreaDims);
    throttledSelectWidgetsInArea(currentSelectAreaDims);
  }, []);
  const onDragEndHandler = useCallback(() => {
    prevContainerScrollTop.current = 0;
    startScrollTop.current = 0;
  }, []);

  const style = useMemo(() => {
    return {
      '--select-area-top': `${selectAreaDims.top}px`,
      '--select-area-left': `${selectAreaDims.left}px`,
      '--select-area-width': `${selectAreaDims.width}px`,
      '--select-area-height': `${selectAreaDims.height}px`,
    } as CSSProperties;
  }, [selectAreaDims]);
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null,
  );
  useAutoRun(() => {
    const scrollableContainer =
      editorStore.currentPage.rootWidget.scrollableContainer;
    setScrollContainer(scrollableContainer);
  });
  if (!scrollContainer) return null;
  return (
    <div style={style} data-type="MULTI_SELECT">
      <Selecto
        className="!pointer-events-none !absolute !left-[var(--select-area-left)] !top-[var(--select-area-top)] !h-[var(--select-area-height)] !w-[var(--select-area-width)] !transform-none"
        ref={selectoRef}
        container={scrollContainer}
        dragContainer={scrollContainer}
        scrollOptions={{
          container: scrollContainer,
        }}
        selectByClick={false}
        hitRate={0}
        dragCondition={(e) => {
          const triggerTarget = e.inputEvent.target;
          return triggerTarget === editorStore.currentPage.rootWidget.canvas;
        }}
        onDragEnd={onDragEndHandler}
        onDrag={onDragHandler}
        onDragStart={onDragStartHandler}
        preventClickEventOnDrag={true}
      />
    </div>
  );
});

export { MultiSelect };
