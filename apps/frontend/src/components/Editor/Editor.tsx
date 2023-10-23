import React, {
  createElement,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { ROOT_NODE_ID } from '@/lib/constants';
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
const { setDimensions } = store.getState();
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
    //set width and height of root to store
    setDimensions(ROOT_NODE_ID, { width, height, x: 0, y: 0 });
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
    setDimensions(ROOT_NODE_ID, { width, height, x: 0, y: 0 });
  };

  return (
    <div
      id="webloom-root"
      className="relative h-full w-full bg-white"
      ref={ref}
    >
      <WebloomAdapter droppable id={ROOT_NODE_ID}>
        {children}
      </WebloomAdapter>
    </div>
  );
};
WebloomRoot.displayName = 'WebloomRoot';

function WebloomElement({ id }: { id: string }) {
  const wholeTree = store.getState().tree;
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
  if (id === 'new') return null;
  return (
    <WebloomAdapter draggable droppable resizable key={id} id={id}>
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
    width: 1024,
    height: 768,
    columnsCount: NUMBER_OF_COLUMNS,
    nodes: [],
    parent: null,
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-red-500',
    },
    rowsCount: Infinity,
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
  const root = store((state) => state.tree[ROOT_NODE_ID]);
  const draggedNode = store((state) => state.draggedNode);
  const mousePos = useRef({ x: 0, y: 0 });
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      delay: 0,
      tolerance: 0,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 0,
      tolerance: 0,
    },
  });

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
      const y = normalize(mousePos.current.y / gridrow, gridrow);
      commandManager.executeCommand(
        DragAction.start({
          id: 'new',
          mouseStartPosition: mousePos.current,
          new: {
            parent: ROOT_NODE_ID,
            startPosition: { x, y },
            type: e.active.data.current.type,
          },
        }),
      );
    }
  };
  const handleDragMove = (e: DragMoveEvent) => {
    if (draggedNode !== null) {
      commandManager.executeCommand(
        DragAction.move(mousePos.current, e.over?.id as string),
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

  useEffect(() => {
    const handleMouseMove = (e: PointerEvent) => {
      const dom = root.dom;
      if (!dom) return;
      const boundingRect = dom.getBoundingClientRect();
      const x = boundingRect.left;
      const y = boundingRect.top;

      mousePos.current = { x: e.clientX - x, y: e.clientY - y };
    };
    window.addEventListener('pointermove', handleMouseMove);
    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
    };
  }, [root.dom]);
  if (!root) return null;
  return (
    <div className="isolate flex h-full w-full">
      <DndContext
        autoScroll
        collisionDetection={pointerWithin}
        sensors={sensors}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragMove={handleDragMove}
      >
        {/*sidebar*/}
        <div className="h-full w-1/5 bg-gray-200"></div>

        <div className="relative h-full w-4/5 bg-gray-900">
          <WebloomElementShadow />
          {/*main*/}
          <WebloomRoot />
          <Grid gridSize={root.width / NUMBER_OF_COLUMNS} />
        </div>
        <div className="h-full w-1/5 bg-gray-200 p-4">
          <div className="h-1/4 w-full bg-gray-300 ">sidebar</div>
          {Object.entries(WebloomComponents).map(([name, component]) => {
            const Component = component.component;
            return (
              <NewNodeAdapter type={name} key={name}>
                <Component {...component.initialProps} />
              </NewNodeAdapter>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

export default Editor;
