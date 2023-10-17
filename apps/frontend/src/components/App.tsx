import React, {
  createElement,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef
} from 'react';

import store, { WebloomNode, WebloomTree } from '../store';
import { WebloomButton } from './Editor/WebloomComponents/Button';
import { WebloomContainer } from './Editor/WebloomComponents/Container';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import { WebloomContext } from './Editor/WebloomComponents/lib/WebloomContext';
import { WebloomAdapter } from './Editor/WebloomComponents/lib/WebloomAdapter';
import { WebloomComponents } from './Editor/WebloomComponents';
import NewNodeAdapter from './Editor/WebloomComponents/lib/NewNodeAdapter';

import { useSetDom } from '@/hooks/useSetDom';
import { normalize, snapModifier } from '@/lib/utils';
import { WebloomElementShadow } from './Editor/WebloomComponents/lib/WebloomElementShadow';
import { getEventCoordinates } from '@dnd-kit/utilities';
import { Grid } from './Editor/WebloomComponents/lib/Grid';
import { NUMBER_OF_COLUMNS } from '@/lib/constants';
import { nanoid } from 'nanoid';
const { setDimensions } = store.getState();
const WebloomRoot = () => {
  const wholeTree = store.getState().tree;
  const tree = wholeTree['root'];
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
    setDimensions('root', { width, height, x: 0, y: 0 });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  useSetDom(ref, 'root');
  const handleResize = () => {
    if (!ref.current) return;
    const width = ref.current?.clientWidth;
    const height = ref.current?.clientHeight;
    setDimensions('root', { width, height, x: 0, y: 0 });
  };

  return (
    <div
      id="webloom-root"
      className="relative h-full w-full bg-white"
      ref={ref}
    >
      <WebloomContext.Provider value={{ id: 'root' }}>
        <WebloomAdapter droppable>{children}</WebloomAdapter>
      </WebloomContext.Provider>
    </div>
  );
};
WebloomRoot.displayName = 'WebloomRoot';

function WebloomElement({ id }: { id: string }) {
  const wholeTree = store.getState().tree;

  //get setter

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
    [tree.type, tree.props, children]
  );
  if (id === 'new') return null;

  return (
    <WebloomContext.Provider
      value={{
        id
      }}
    >
      <WebloomAdapter draggable droppable resizable key={id}>
        {rendered}
      </WebloomAdapter>
    </WebloomContext.Provider>
  );
}

// function ResolveNewComponents(
//   components: [el: React.ReactElement, name: string][]
// ) {
//   return components.map(([el, name]) => {
//     //create WebloomNode
//     const test = el.type
//     const newNode: WebloomNode = {
//       id: nanoid(),
//       name,
//       type: el,
//       nodes: [],
//       parent: null,
//       props: el.props
//     }
//     return (
//       <button
//         onDragStart={() => {
//           console.log('drag start')
//         }}
//       >
//         {name}
//       </button>
//     )
//   })
// }

const initTree: WebloomTree = {
  root: {
    id: 'root',
    name: 'root',
    type: WebloomContainer,
    x: 0,
    y: 0,
    width: 1024,
    height: 768,
    columnsCount: NUMBER_OF_COLUMNS,
    nodes: ['button', 'button2'],
    parent: null,
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-red-500'
    },
    rowsCount: Infinity
  },
  button: {
    id: 'button',
    name: 'button',
    type: WebloomButton,
    nodes: [],
    parent: 'root',
    dom: null,
    props: {
      text: 'button1',
      color: 'red'
    },
    height: 0,
    width: 0,
    columnsCount: 4,
    rowsCount: 8,
    x: 4,
    y: 0
  },
  button2: {
    id: 'button2',
    name: 'button2',
    type: WebloomButton,
    nodes: [],
    parent: 'root',
    dom: null,
    props: {
      text: 'button2',
      color: 'green'
    },
    height: 0,
    width: 0,
    x: 8,
    y: 20,
    columnsCount: 8,
    rowsCount: 15
  }
};
store.setState((state) => {
  state.tree = initTree;
  return state;
});
function App() {
  const wholeTree = store((state) => state.tree);
  const mousePos = useRef({ x: 0, y: 0 });
  const [newStart, setNewStart] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [newTranslate, setNewTranslate] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      delay: 5,
      tolerance: 0
    }
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 5,
      tolerance: 0
    }
  });
  const sensors = useSensors(mouseSensor, touchSensor);
  useEffect(() => {}, [wholeTree]);
  const handleDragEnd = (e: DragEndEvent) => {
    if (e.active.data.current?.isNew) {
      if (!e.over || e.over.id !== 'root') return;

      const newNode = wholeTree['new'];
      const [gridrow, gridcol] = store.getState().getGridSize('new');
      store.getState().removeNode('new');
      newNode.id = nanoid();
      store.getState().addNode(newNode, 'root');
      store.getState().moveNodeIntoGrid(newNode.id, {
        x: newTranslate!.x / gridcol,
        y: newTranslate!.y / gridrow
      });
      setNewStart(null);
      setNewTranslate(null);
    } else {
      const id = e.active.id;
      if (!wholeTree[id]) return;
      //get transalted distance
      const x = e.delta.x;
      const y = e.delta.y;
      const [gridrow, gridcol] = store.getState().getGridSize(id as string);
      //update store
      store.getState().moveNodeIntoGrid(id as string, {
        x: x / gridcol,
        y: y / gridrow
      });
    }
    store.getState().setOverNode(null);
  };
  useEffect(() => {
    const handleMouseMove = (e: PointerEvent) => {
      const dom = wholeTree.root.dom;
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
  }, [wholeTree.root.dom]);
  return (
    <div className="isolate flex h-full w-full">
      <DndContext
        collisionDetection={pointerWithin}
        sensors={sensors}
        onDragOver={(e) => {
          if (e.active.id === e.over?.id) return;
          store.getState().setOverNode((e.over?.id as string) ?? null);
          if (e.active.data.current?.isNew && newStart === null) {
            const [gridrow] = store.getState().getGridSize('root');
            setNewStart({
              x: mousePos.current.x,
              y: mousePos.current.y
            });
            let x = 0;
            const root = store.getState().tree['root'];
            const rootBoundingRect = root.dom!.getBoundingClientRect();
            if (mousePos.current.x > rootBoundingRect.width / 2) {
              x = NUMBER_OF_COLUMNS - 2;
            }
            const y = normalize(mousePos.current.y / gridrow, gridrow);
            const node: WebloomNode = {
              id: 'new',
              name: 'new',
              type: WebloomComponents[
                e.active.data.current!.type as keyof typeof WebloomComponents
              ].component,
              nodes: [],
              //todo change this to be the parent
              parent: 'root',
              dom: null,
              props: {
                className: 'bg-red-500'
              },
              height: 0,
              width: 0,
              x: x,
              y: y,
              columnsCount: 4,
              rowsCount: 8
            };
            store.getState().addNode(node, 'root');
          }
        }}
        onDragEnd={handleDragEnd}
        onDragMove={(e) => {
          if (e.active.data.current?.isNew) {
            if (!newStart) return;
            const { x, y } = mousePos.current;
            const [gridrow, gridcol] = store.getState().getGridSize('new');
            setNewTranslate({
              x: normalize(x - newStart.x, gridcol),
              y: normalize(y - newStart.y, gridrow)
            });
          } else {
            const mouseStart = getEventCoordinates(e.activatorEvent)!;
            store.getState().setMousePos({
              x: mouseStart.x + e.delta.x,
              y: mouseStart.y + e.delta.y
            });
          }
        }}
        modifiers={[snapModifier]} //todo: may need to change this when we have nested containers and stuff
      >
        {/*sidebar*/}
        <div className="h-full w-1/5 bg-gray-200"></div>

        <div className="relative h-full w-4/5 bg-gray-900">
          <WebloomElementShadow delta={newTranslate} isNew={!!newStart} />
          {/*main*/}
          <WebloomRoot />
          <Grid gridSize={wholeTree['root'].width / 32} />
        </div>
        <div className="h-full w-1/5 bg-gray-200 p-4">
          <div className="h-1/4 w-full bg-gray-300 ">sidebar</div>
          {Object.entries(WebloomComponents).map(([name, component]) => {
            return (
              <NewNodeAdapter type={name} key={name}>
                {component.component(component.initialProps)}
              </NewNodeAdapter>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

export default App;
