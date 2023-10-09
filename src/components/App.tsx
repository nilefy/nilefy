import { createStore, Provider, atom, useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import React, {
  createElement,
  useState,
  useMemo,
  useEffect,
  cloneElement
} from 'react';

const store = createStore();
function dragStart(e: DragEvent) {
  console.log('drag start', e);
}
const WebloomRoot = React.forwardRef<HTMLDivElement>((props, ref) => {
  const wholeTree = store.get(treeAtom);
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
  const wholeTree = store.get(treeAtom);
  const [, setDom] = useAtom(handleSetDomAtom);
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
    if (ref.current) {
      const curRef = ref.current;
      ref.current.addEventListener('click', dragStart);
      return () => {
        curRef.removeEventListener('click', dragStart);
      };
    }
  }, [ref.current]);
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
function Counter({ text, color }: { text: string; color: string }) {
  const [counter, setCounter] = useState(0);
  return (
    <div>
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
type WebloomNode = {
  id: string;
  name: string;
  //type can be a react component or a string
  type: React.ElementType | string;
  dom: HTMLElement | null;
  nodes: string[];
  parent: string | null;
  props: Record<string, unknown>;
  isCanvas?: boolean;
};
type WebloomTree = {
  [key: string]: WebloomNode;
};
const treeAtom = atom<WebloomTree>({
  root: {
    id: 'root',
    name: 'root',
    type: 'div',
    nodes: ['text'],
    parent: null,
    isCanvas: true,
    dom: null,
    props: {
      className: 'h-full w-full bg-red-500'
    }
  },
  text: {
    id: 'text',
    name: 'text',
    type: Text,
    nodes: [],
    parent: 'root',
    dom: null,
    props: {
      text: 'hello world'
    }
  }
});
const handleSetDomAtom = atom(
  null,
  (get, set, id: string, dom: HTMLElement) => {
    const wholeTree = get(treeAtom);
    wholeTree[id].dom = dom;
    set(treeAtom, wholeTree);
  }
);

function App() {
  const [wholeTree, setWholeTree] = useAtom(treeAtom);
  const rootRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    console.log(wholeTree);
  }, [wholeTree]);

  return (
    <Provider store={store}>
      <div className="flex h-full w-full">
        {/*sidebar*/}
        <div className="h-full w-1/5 bg-gray-200"></div>
        {/*main*/}
        <div className="h-full w-4/5 bg-gray-900">
          <WebloomElement id="root" />
        </div>
      </div>
    </Provider>
  );
}

export default App;
