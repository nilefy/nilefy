import React, {
  createElement,
  useMemo,
  useEffect,
  useLayoutEffect,
} from 'react';
import store, { WebloomNode, WebloomTree } from '../store';
import { WebloomButton } from './Editor/WebloomComponents/Button';
import { WebloomContainer } from './Editor/WebloomComponents/Container';
import { DndContext, DragEndEvent } from '@dnd-kit/core';

import { WebloomContext } from './Editor/WebloomComponents/lib/WebloomContext';
import { WebloomAdapter } from './Editor/WebloomComponents/lib/WebloomAdapter';
import { WebloomComponents } from './Editor/WebloomComponents';
import NewNodeAdapter from './Editor/WebloomComponents/lib/NewNodeAdapter';
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
    [tree.type, tree.props, children],
  );

  return (
    <WebloomContext.Provider
      value={{
        id,
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
    width: 0,
    height: 0,
    nodes: ['button', 'button2'],
    parent: null,
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-red-500',
    },
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
      color: 'red',
    },
    height: 40,
    width: 100,
    x: 0,
    y: 0,
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
      color: 'green',
    },
    height: 40,
    width: 100,
    x: 0,
    y: 40,
  },
};
store.setState((state) => {
  state.tree = initTree;
  return state;
});

function App() {
  const wholeTree = store((state) => state.tree);
  useEffect(() => {
    console.log(wholeTree);
  }, [wholeTree]);
  const handleDragEnd = (e: DragEndEvent) => {
    if (e.active.data.current?.isNew && e.over?.id === 'root') {
      const x = e.delta.x + -e.over.rect.left || 0;
      const y = e.delta.y + e.over.rect.top || 0;
      const width = e.active.rect.current.initial?.width || 20;
      const height = e.active.rect.current.initial?.height || 10;
      const type = e.active.data.current.type as keyof typeof WebloomComponents;
      const node: WebloomNode = {
        type: WebloomComponents[type].component,
        id: e.active.data.current.id,
        name: type,
        nodes: [],
        parent: null,
        dom: null,
        props: WebloomComponents[type].initialProps,
        x: x,
        y: y,
        width: width,
        height: height,
      };
      store.getState().addNode(node, 'root');
    }
  };
  return (
    <div className="isolate flex h-full w-full">
      <DndContext
        onDragEnd={handleDragEnd}

        //todo: may need to change this when we have nested containers and stuff
      >
        {/*sidebar*/}

        <div className="h-full w-1/5 bg-gray-200">
          {Object.entries(WebloomComponents).map(([name, component]) => {
            return (
              <NewNodeAdapter type={name} key={name} id={nanoid()}>
                {component.component(component.initialProps)}
              </NewNodeAdapter>
            );
          })}
        </div>
        <div className="h-full w-4/5 bg-gray-900">
          {/*main*/}
          <WebloomRoot />
        </div>
      </DndContext>
    </div>
  );
}

export default App;
