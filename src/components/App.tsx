import { nanoid } from 'nanoid';
import React, {
  createElement,
  useState,
  useMemo,
  useEffect,
  forwardRef
} from 'react';
import store, { WebloomTree } from 'store';
const { setDom, moveNode, setDraggedNode } = store.getState();
function dragStart(e: DragEvent, type: 'new' | 'move', id?: string) {
  e.stopPropagation();
  console.log('dragstart', id);
  if (type === 'new') {
  } else {
    //set currentlyDraggingAtom
    setDraggedNode(id as string);
  }
}
function drop(e: DragEvent, id: string) {
  //move currentlyDraggingAtom to id
  console.log('drop', id);
  e.stopPropagation();
  e.preventDefault();
  const currentlyDragging = store.getState().draggedNode;
  if (!currentlyDragging) return;
  console.log('here ', currentlyDragging, id);

  moveNode(currentlyDragging, id);
}
function dragOver(e: DragEvent) {
  e.preventDefault();
}

const WebloomRoot = React.forwardRef<HTMLDivElement>((props, ref) => {
  const wholeTree = store.getState().tree;
  const tree = wholeTree['root'];
  const children = useMemo(() => {
    let children = tree.props.children as React.ReactElement[];
    if (tree.nodes.length > 0) {
      children = tree.nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [tree.nodes, tree.props.children]);
  return (
    <div ref={ref} id="webloom-root">
      {children}
    </div>
  );
});
WebloomRoot.displayName = 'WebloomRoot';

function WebloomElement({ id }: { id: string }) {
  const wholeTree = store.getState().tree;

  //get setter

  const ref = React.useRef<HTMLElement>(null);
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
    () => createElement(tree.type, { ...tree.props, ref }, children),
    [tree.type, tree.props, children]
  );
  useEffect(() => {
    if (ref.current) {
      setDom(id, ref.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, id]);
  useEffect(() => {
    function dragStartHandler(e: DragEvent) {
      dragStart(e, 'move', id);
    }
    function dropHandler(e: DragEvent) {
      drop(e, id);
    }

    if (ref.current) {
      const curRef = ref.current;
      ref.current.draggable = true;
      ref.current.addEventListener('dragstart', dragStartHandler);
      if (tree.isCanvas) {
        ref.current.addEventListener('drop', dropHandler);
        ref.current.addEventListener('dragover', dragOver);
      }
      return () => {
        console.log('unmount');
        curRef.removeEventListener('dragstart', dragStartHandler);
        if (tree.isCanvas) {
          curRef.removeEventListener('drop', dropHandler);
          curRef.removeEventListener('dragover', dragOver);
        }
      };
    }
  }, [tree.isCanvas]);
  return rendered;
}

const Text = React.forwardRef<HTMLParagraphElement, { text: string }>(
  ({ text }, ref) => {
    return <p ref={ref}>{text}</p>;
  }
);
Text.displayName = 'Text';
const Button = React.forwardRef<
  HTMLButtonElement,
  {
    text: string;
    color: string;
    onClick: () => void;
  }
>(({ text, color, onClick }, ref) => {
  return (
    <button
      style={{
        backgroundColor: color
      }}
      onClick={onClick}
      ref={ref}
    >
      <Text text={text}></Text>
    </button>
  );
});
Button.displayName = 'Button';
export const Counter = forwardRef<
  HTMLDivElement,
  { text: string; color: string }
>(({ text, color }, ref) => {
  const [counter, setCounter] = useState(0);
  return (
    <div ref={ref}>
      <Button
        text={text}
        color={color}
        onClick={() => {
          setCounter(counter + 1);
        }}
      ></Button>
      <Text text={counter.toString()}></Text>
    </div>
  );
});
Counter.displayName = 'Counter';
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

const Container = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className: string }
>(({ children, className }, ref) => {
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
});
Container.displayName = 'Container';
const initTree: WebloomTree = {
  root: {
    id: 'root',
    name: 'root',
    type: 'div',
    nodes: ['counter', 'container'],
    parent: null,
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-red-500'
    }
  },
  counter: {
    id: 'counter',
    name: 'counter',
    type: Counter,
    nodes: [],
    parent: 'root',
    dom: null,
    props: {
      text: 'hello world',
      color: 'red'
    }
  },
  container: {
    id: 'container',
    name: 'container',
    type: Container,
    nodes: ['counter2'],
    parent: 'root',
    dom: null,
    isCanvas: true,
    props: {
      className: 'bg-blue-500'
    }
  },
  counter2: {
    id: 'counter2',
    name: 'counter2',
    type: Counter,
    nodes: [],
    parent: 'container',
    dom: null,
    props: {
      text: 'hello world',
      color: 'red'
    }
  }
};
store.setState((state) => {
  state.tree = initTree;
  return state;
});
function App() {
  const wholeTree = store((state) => state.tree);
  const rootRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full w-full">
      {/*sidebar*/}
      <div className="h-full w-1/5 bg-gray-200"></div>
      {/*main*/}
      <div className="h-full w-4/5 bg-gray-900">
        <WebloomElement id="root" />
      </div>
    </div>
  );
}

export default App;
