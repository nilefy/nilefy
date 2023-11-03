import React, {
  createElement,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { ROOT_NODE_ID, ROW_HEIGHT } from '@/lib/constants';
import store, { WebloomTree } from '../../store';
import { WebloomContainer } from './WebloomComponents/Container';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { WebloomAdapter } from './WebloomComponents/lib/WebloomAdapter';
import { WebloomComponents } from './WebloomComponents';
import NewNodeAdapter from './WebloomComponents/lib/NewNodeAdapter';

import { useSetDom } from '@/hooks/useSetDom';
import { normalize } from '@/lib/utils';
import { WebloomElementShadow } from './WebloomComponents/lib/WebloomElementShadow';
import Grid from './WebloomComponents/lib/Grid';
import { NUMBER_OF_COLUMNS } from '@/lib/constants';
import { commandManager } from '@/Actions/CommandManager';
import DragAction from '@/Actions/Editor/Drag';
const { resizeCanvas } = store.getState();
const WebloomRoot = () => {
  const wholeTree = store.getState().tree;
  const tree = wholeTree[ROOT_NODE_ID];
  const ref = React.useRef<HTMLDivElement>(null);
  const children = useMemo(() => {
    let children = tree.props.children as React.ReactElement[];
    if (tree.nodes.length > 0) {
      children = tree.nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [tree.nodes, tree.props.children]);
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
    const rowsCount = tree.rowsCount;
    resizeCanvas(ROOT_NODE_ID, { rowsCount });
  }, [tree.rowsCount]);
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
    const height = ref.current?.clientHeight;
    const columnWidth = width / NUMBER_OF_COLUMNS;
    const rowsCount = Math.floor(height / ROW_HEIGHT);
    resizeCanvas(ROOT_NODE_ID, { columnWidth, rowsCount });
  };

  return (
    <div
      id="webloom-root"
      className="relative h-full w-full bg-white"
      ref={ref}
    >
      <WebloomAdapter droppable id={ROOT_NODE_ID}>
        <Grid id={ROOT_NODE_ID} />
        {children}
      </WebloomAdapter>
    </div>
  );
};
WebloomRoot.displayName = 'WebloomRoot';

function WebloomElement({ id }: { id: string }) {
  const wholeTree = store.getState().tree;
  const dragged = store((state) => state.draggedNode);
  const tree = wholeTree[id];
  const children = useMemo(() => {
    let children = tree.props.children as React.ReactElement[];
    if (tree.nodes.length > 0) {
      children = tree.nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [tree.nodes, tree.props.children]);
  const rendered = useMemo(
    () => createElement(tree.type, tree.props, children),
    [tree.type, tree.props, children],
  );
  if (id === 'new' || id === dragged) return null;
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
    type: WebloomContainer,
    x: 0,
    y: 0,
    columnWidth: 0,
    columnsCount: NUMBER_OF_COLUMNS,
    nodes: ['container-1', 'container-3'],
    parent: null,
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-red-500',
    },
    rowsCount: 1000,
  },
  'container-1': {
    id: 'container-1',
    name: 'container-1',
    type: WebloomContainer,
    x: 5,
    y: 30,
    columnWidth: 15,
    columnsCount: 14,
    nodes: ['container-2'],
    parent: ROOT_NODE_ID,
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-blue-500',
      color: 'red',
    },
    rowsCount: 50,
  },
  'container-2': {
    id: 'container-2',
    name: 'container-2',
    type: WebloomContainer,
    x: 1,
    y: 2,
    columnWidth: 15,
    columnsCount: 14,
    nodes: [],
    parent: 'container-1',
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-blue-500',
      color: 'blue',
    },
    rowsCount: 30,
  },
  'container-3': {
    id: 'container-3',
    name: 'container-3',
    type: WebloomContainer,
    x: 15,
    y: 600,
    columnWidth: 15,
    columnsCount: 5,
    nodes: [],
    parent: ROOT_NODE_ID,
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-blue-500',
      color: 'blue',
    },
    rowsCount: 30,
  },
};
store.setState((state) => {
  state.tree = initTree;
  return state;
});
function Editor() {
  useHotkeys('ctrl+z', () => {
    commandManager.undoCommand();
  });
  const editorRef = useRef<HTMLDivElement>(null);
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
    <div className="isolate flex h-full max-h-full w-full  bg-transparent">
      <DndContext
        collisionDetection={pointerWithin}
        sensors={sensors}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
        onDragCancel={handleCancel}
        autoScroll={true}
      >
        {/*sidebar*/}
        <div className="h-full w-1/5 bg-gray-200"></div>

        <div
          ref={editorRef}
          className="relative h-full w-full touch-none overflow-x-clip overflow-y-scroll bg-white"
          style={{
            scrollbarGutter: 'stable',
            scrollbarWidth: 'thin',
          }}
        >
          <WebloomElementShadow />
          {/*main*/}
          <WebloomRoot />
        </div>
        <div className="h-full w-1/5 bg-gray-200 p-4">
          <div className="h-1/4 w-full bg-gray-300 ">
            {Object.entries(WebloomComponents).map(([name, component]) => {
              return (
                <NewNodeAdapter type={name} key={name}>
                  <div className="h-5 w-full">{component.name}</div>
                </NewNodeAdapter>
              );
            })}
          </div>
        </div>
      </DndContext>
    </div>
  );
}

export default Editor;
