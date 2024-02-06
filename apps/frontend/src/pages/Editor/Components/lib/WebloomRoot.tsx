import { editorStore } from '@/lib/Editor/Models';
import { Grid, WebloomAdapter, WebloomElement } from '.';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useSetDom } from '@/hooks';
import { observer } from 'mobx-react-lite';
import {
  createPopperLite as createPopper,
  preventOverflow,
  flip,
} from '@popperjs/core';
import { Trash2 } from 'lucide-react';
import { DeleteAction } from '@/Actions/Editor/Delete';
import { commandManager } from '@/Actions/CommandManager';
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

  const selectedNode = editorStore.currentPage.firstSelectedWidget;
  const selectedNodeParent = selectedNode
    ? editorStore.currentPage.getWidgetById(selectedNode).parentId
    : null;
  const dims = selectedNode
    ? editorStore.currentPage.getWidgetById(selectedNode).pixelDimensions
    : null;

  useEffect(() => {
    createPopper(
      //@ts-expect-error bla
      document.querySelector(`[data-id="${selectedNode}"]`),
      document.querySelector(`#${selectedNode}`),
      {
        placement: 'top',
        modifiers: [preventOverflow, flip],
      },
    );
  }, [selectedNode, dims?.y]);
  return (
    <div id="webloom-root" className="relative h-screen w-full" ref={ref}>
      <WebloomAdapter droppable id={EDITOR_CONSTANTS.ROOT_NODE_ID}>
        <Grid id={EDITOR_CONSTANTS.ROOT_NODE_ID} />
        {selectedNodeParent == EDITOR_CONSTANTS.ROOT_NODE_ID && (
          <WebloomAdapter draggable droppable overflow id={selectedNode}>
            <div
              id={selectedNode}
              role="tooltip"
              key={selectedNode}
              className="!left-0  h-5 w-full text-sm text-white"
            >
              <div className="bg-blue-500 w-20 flex items-center justify-between">
                <p>{selectedNode}</p>

                <Trash2 size={16} />
              </div>
            </div>
          </WebloomAdapter>
        )}
        {nodes.map((node) => (
          <>
            <WebloomElement id={node} key={node} />
          </>
        ))}
      </WebloomAdapter>
    </div>
  );
});
