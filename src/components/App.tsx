import { nanoid } from 'nanoid';
import React, {
    createElement,
    useMemo,
    useEffect,
    useLayoutEffect
} from 'react';
import store, { WebloomTree } from 'store';
import { WebloomButton } from './Editor/WebloomComponents/Button';
import { WebloomContainer } from './Editor/WebloomComponents/Container';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import WebloomDraggable from './Editor/WebloomComponents/lib/Draggable';
import { WebloomDroppable } from './Editor/WebloomComponents/lib/Droppable';
import {
    createSnapModifier,
    restrictToParentElement
} from '@dnd-kit/modifiers';
import { GRID_CELL_SIDE } from 'lib/constants';
import { WebloomContext } from './Editor/WebloomComponents/lib/WebloomContext';
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
        <div id="webloom-root" className="h-full w-full bg-white" ref={ref}>
            <WebloomContext.Provider value={{ id: 'root' }}>
                <WebloomDroppable>{children}</WebloomDroppable>
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
        () =>
            createElement(
                tree.type,
                { ...tree.props, webloomId: id },
                children
            ),
        [tree.type, tree.props, children, id]
    );
    return (
        <WebloomContext.Provider
            value={{
                id
            }}
        >
            <WebloomDraggable>
                <WebloomDroppable>{rendered}</WebloomDroppable>
            </WebloomDraggable>
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
            className: 'h-full w-full bg-red-500'
        }
    },

    button: {
        id: 'button',
        name: 'button',
        type: WebloomButton,
        nodes: [],
        parent: 'root',
        dom: null,
        props: {
            text: 'Webloom',
            color: 'red'
        },
        height: 40,
        width: 100,
        x: 0,
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
            text: 'Webloom',
            color: 'green'
        },
        height: 40,
        width: 100,
        x: 0,
        y: 0
    }
};
store.setState((state) => {
    state.tree = initTree;
    return state;
});

const snapToGridModifier = createSnapModifier(GRID_CELL_SIDE);
function App() {
    const wholeTree = store((state) => state.tree);
    useEffect(() => {}, [wholeTree]);
    const handleDragEnd = (e: DragEndEvent) => {
        //get id of element
        const id = e.active.id;
        //get transalted distance
        const x = e.delta.x;
        const y = e.delta.y;
        console.log(e.over?.id);
        for (const collision of e.collisions || []) {
            if (collision.id !== 'root' && collision.id !== e.active.id) return;
        }
        //update store
        store.setState((state) => {
            state.tree[id].x += x;
            state.tree[id].y += y;
            return state;
        });
    };
    return (
        <div className="flex h-full w-full">
            {/*sidebar*/}
            <div className="h-full w-1/5 bg-gray-200"></div>
            {/*main*/}
            <DndContext
                onDragEnd={handleDragEnd}
                //todo: may need to change this when we have nested containers and stuff
                modifiers={[restrictToParentElement, snapToGridModifier]}
            >
                <div className="h-full w-4/5 bg-gray-900">
                    <WebloomRoot />
                </div>
            </DndContext>
        </div>
    );
}

export default App;
