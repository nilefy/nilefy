import Selecto from 'react-selecto';
import React, {
  createElement,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  ElementType,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import store, { WebloomTree } from '../../store';

import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { useSetDom } from '@/hooks/useSetDom';
import {
  NUMBER_OF_COLUMNS,
  PREVIEW_NODE_ID,
  ROOT_NODE_ID,
  ROW_HEIGHT,
} from '@/lib/Editor/constants';
import {
  Grid,
  MultiSelectBounding,
  ResizeHandlers,
  WebloomAdapter,
  WebloomElementShadow,
} from './Components/lib';
import { commandManager } from '@/actions/commandManager';
import DragAction from '@/actions/Editor/Drag';
import { normalize } from '@/lib/Editor/utils';
import { SelectionAction } from '@/actions/Editor/selection';
import { RightSidebar } from './Components/Rightsidebar/index';
import { WebloomWidgets } from './Components';
import { ScrollArea } from '@/components/ui/scroll-area';

const { resizeCanvas } = store.getState();

function WebloomRoot() {
  const root = store((state) => state.tree[ROOT_NODE_ID]);
  const ref = React.useRef<HTMLDivElement>(null);
  const children = useMemo(() => {
    let children = root.widget.props.children as React.ReactElement[];
    if (root.nodes.length > 0) {
      children = root.nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [root.nodes, root.widget.props.children]);
  useLayoutEffect(() => {
    //get width and height of root
    if (!ref.current) return;
    const width = ref.current?.clientWidth;
    const height = ref.current?.clientHeight;
    const columnWidth = width / NUMBER_OF_COLUMNS;
    const rowsCount = Math.floor(height / ROW_HEIGHT);
    resizeCanvas(ROOT_NODE_ID, { columnWidth, rowsCount });
  }, []);
  useEffect(() => {
    const rowsCount = root.rowsCount;
    resizeCanvas(ROOT_NODE_ID, { rowsCount });
  }, [root.rowsCount]);
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useSetDom(ref, ROOT_NODE_ID);
  const handleResize = () => {
    if (!ref.current) return;
    const width = ref.current?.clientWidth;
    const columnWidth = width / NUMBER_OF_COLUMNS;
    resizeCanvas(ROOT_NODE_ID, { columnWidth });
  };

  return (
    <div id="webloom-root" className="relative h-full w-full" ref={ref}>
      <WebloomAdapter droppable id={ROOT_NODE_ID}>
        <Grid id={ROOT_NODE_ID} />
        {children}
      </WebloomAdapter>
    </div>
  );
}
WebloomRoot.displayName = 'WebloomRoot';

function WebloomElement({ id }: { id: string }) {
  const wholeTree = store.getState().tree;
  const tree = wholeTree[id];
  const nodes = store((state) => state.tree[id].nodes);
  const props = store((state) => state.tree[id].widget.props);
  const children = useMemo(() => {
    let children = props.children as React.ReactElement[];
    if (nodes.length > 0) {
      children = nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [nodes, props.children]);
  const rendered = useMemo(
    () =>
      createElement(
        WebloomWidgets[tree.widget.type].component as ElementType,
        props,
        children,
      ),
    [tree.widget.type, props, children],
  );
  if (id === PREVIEW_NODE_ID) return null;
  return (
    <WebloomAdapter draggable droppable resizable key={id} id={id}>
      {tree.isCanvas && <Grid id={id} />}
      {rendered}
    </WebloomAdapter>
  );
}

const initTree: WebloomTree = {
  [ROOT_NODE_ID]: {
    id: ROOT_NODE_ID,
    name: ROOT_NODE_ID,
    col: 0,
    row: 0,
    columnWidth: 0,
    columnsCount: NUMBER_OF_COLUMNS,
    nodes: [],
    parent: ROOT_NODE_ID,
    isCanvas: true,
    dom: null,
    rowsCount: 1000,
    widget: {
      props: {
        className: 'h-full w-full',
      },
      type: 'WebloomContainer',
    },
  },
};
store.setState((state) => {
  state.tree = initTree;
  return state;
});

function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);
  console.log(editorRef.current);
  useHotkeys('ctrl+z', () => {
    commandManager.undoCommand();
  });
  const root = store((state) => state.tree[ROOT_NODE_ID]);
  const draggedNode = store((state) => state.draggedNode);
  const mousePos = useRef({ x: 0, y: 0 });
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const sensors = useSensors(mouseSensor, touchSensor);
  const handleDragEnd = (e: DragEndEvent) => {
    if (!e.active.data.current) return;
    const over: string | null = e.over ? (e.over.id as string) : null;
    commandManager.executeCommand(DragAction.end(over));
    store.getState().setOverNode(null);
  };
  const handleDragOver = (e: DragOverEvent) => {
    if (e.active.id === e.over?.id) return;
    store.getState().setOverNode((e.over?.id as string) ?? null);
    if (e.active.data.current?.isNew && draggedNode === null) {
      const [gridrow] = store.getState().getGridSize(ROOT_NODE_ID);
      let x = 0;
      const root = store.getState().tree[ROOT_NODE_ID];
      const rootBoundingRect = root.dom!.getBoundingClientRect();
      if (mousePos.current.x > rootBoundingRect.width / 2) {
        x = NUMBER_OF_COLUMNS - 2;
      }
      const y = normalize(
        (mousePos.current.y - editorRef.current!.scrollTop) / gridrow,
        gridrow,
      );

      commandManager.executeCommand(
        DragAction.start({
          id: 'new',
          mouseStartPosition: mousePos.current,
          new: {
            parent: ROOT_NODE_ID,
            startPosition: { x, y },
            type: e.active.data.current.type,
            initialDelta: e.delta,
          },
        }),
      );
    }
  };
  const handleDragMove = (e: DragMoveEvent) => {
    if (draggedNode !== null) {
      console.log(e.delta);

      commandManager.executeCommand(
        DragAction.move(mousePos.current, e.delta, e.over?.id as string),
      );
    } else if (!e.active.data.current?.isNew) {
      commandManager.executeCommand(
        DragAction.start({
          id: e.active.id as string,
          mouseStartPosition: mousePos.current,
        }),
      );
    }
    store.getState().setMousePos(mousePos.current);
  };
  const handleCancel = () => {
    commandManager.executeCommand(DragAction.cancel());
  };
  useEffect(() => {
    const handleMouseMove = (e: PointerEvent) => {
      const dom = root.dom;
      if (!dom) return;
      const boundingRect = dom.getBoundingClientRect();
      const x = boundingRect.left;
      const y = boundingRect.top;

      mousePos.current = { x: e.pageX - x, y: e.pageY - y };
    };

    window.addEventListener('pointermove', handleMouseMove);
    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
    };
  }, [root.dom, draggedNode]);
  if (!root) return null;
  return (
    <div className="isolate flex h-full max-h-full w-full bg-transparent">
      <DndContext
        collisionDetection={pointerWithin}
        sensors={sensors}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        onDragCancel={handleCancel}
        autoScroll={{ layoutShiftCompensation: false }}
      >
        {/*sidebar*/}
        <div className="h-full w-1/5 "></div>
        <ScrollArea ref={editorRef} className=" h-full w-full">
          <WebloomElementShadow />
          <MultiSelectBounding />
          <WebloomRoot />
          <ResizeHandlers />
          <Selecto
            // The container to add a selection element
            container={editorRef.current}
            selectableTargets={['.target']}
            selectFromInside={true}
            selectByClick={false}
            hitRate={100}
            dragCondition={(e) => {
              const triggerTarget = e.inputEvent.target;
              const isRoot = triggerTarget.getAttribute('data-id');
              return isRoot === ROOT_NODE_ID;
            }}
            onSelect={(e) => {
              e.added.forEach((el) => {
                const data = el.getAttribute('data-id');
                if (data) {
                  commandManager.executeCommand(
                    new SelectionAction(data, true),
                  );
                }
              });
              e.removed.forEach((el) => {
                const data = el.getAttribute('data-id');
                if (data) {
                  store.getState().setSelectedNodeIds((prev) => {
                    return new Set([...prev].filter((i) => i !== data));
                  });
                }
              });
            }}
          />
          {/** todo: maybe only use the overlay instead of also having drop shadow in the future but for now this'll do */}
          <DragOverlay
            style={{ display: 'none' }}
            dropAnimation={{ duration: 0 }}
          />
        </ScrollArea>
        {/*right sidebar*/}
        <RightSidebar />
      </DndContext>
    </div>
  );
}

export default Editor;
