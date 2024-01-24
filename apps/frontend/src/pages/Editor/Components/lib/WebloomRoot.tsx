import { editorStore } from '@/lib/Editor/Models';
import { Grid, WebloomAdapter, WebloomElement } from '.';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSetDom } from '@/hooks';
import { observer } from 'mobx-react-lite';

export const WebloomRoot = observer(function WebloomRoot() {
  const root = editorStore.currentPage.rootWidget;
  const nodes = root.nodes;
  const ref = useRef<HTMLDivElement>(null);
  const width = editorStore.currentPage.width;
  const height = editorStore.currentPage.height;

  useLayoutEffect(() => {
    const columnWidth = Math.round(width / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS);
    let rowsCount = editorStore.currentPage.rootWidget.rowsCount;
    if (rowsCount === 0) {
      editorStore.currentPage.setPageDimensions({
        height: ref.current?.clientHeight,
      });
      rowsCount = Math.round(
        ref.current!.clientHeight / EDITOR_CONSTANTS.ROW_HEIGHT,
      );
    }

    editorStore.currentPage.rootWidget.setDimensions({
      columnWidth,
      rowsCount,
    });
  }, [height, width]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useSetDom(ref, EDITOR_CONSTANTS.ROOT_NODE_ID);
  const handleResize = () => {
    if (!ref.current) return;
    const width = ref.current?.clientWidth;
    const height = ref.current?.clientHeight;
    editorStore.currentPage.setPageDimensions({ width, height });
  };

  return (
    <div id="webloom-root" className="relative h-screen w-full" ref={ref}>
      <WebloomAdapter droppable id={EDITOR_CONSTANTS.ROOT_NODE_ID}>
        <Grid id={EDITOR_CONSTANTS.ROOT_NODE_ID} />
        {nodes.map((node) => (
          <WebloomElement id={node} key={node} />
        ))}
      </WebloomAdapter>
    </div>
  );
});
