import React, {
    createElement,
    useMemo,
    useEffect,
    useLayoutEffect,
    useRef,
    useState
} from 'react';

import store, { WebloomNode, WebloomTree } from '../store';
import { WebloomButton } from './Editor/WebloomComponents/Button';
import { WebloomContainer } from './Editor/WebloomComponents/Container';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
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
import {
    normalizePoint,
    restrictToParentElementUnlessNew,
    snapModifier
} from '@/lib/utils';
import { WebloomElementShadow } from './Editor/WebloomComponents/lib/WebloomElementShadow';
import { getEventCoordinates } from '@dnd-kit/utilities';
import { Grid } from './Editor/WebloomComponents/lib/Grid';
import { NUMBER_OF_COLUMNS } from '@/lib/constants';
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
    const [newNode, setNewNode] = React.useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            delay: 20,
            tolerance: 5
        }
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 5,
            tolerance: 5
        }
    });
    const sensors = useSensors(mouseSensor, touchSensor);
    useEffect(() => {}, [wholeTree]);
    const handleDragEnd = (e: DragEndEvent) => {
        if (e.active.data.current?.isNew) {
            if (!e.over || e.over.id !== 'root') return;
            const initial = e.active.rect.current.initial!;
            const [iniX, iniY] = normalizePoint([initial.left, initial.top]);
            const boundingRect = e.over.rect;
            //  container's displacement + distance dragged + dragged element's initial displacement

            const x = boundingRect.left + e.delta.x + iniX;
            const y = boundingRect.top + e.delta.y + iniY;
            const width = 180;
            const height = 60;
            const type = e.active.data.current
                .type as keyof typeof WebloomComponents;
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
                height: height
            };
            setNewNode(null);
            store.getState().addNode(node, 'root');
        } else {
            const id = e.active.id;
            if (!wholeTree[id]) return;
            //get transalted distance
            const x = e.delta.x;
            const y = e.delta.y;
            const parentId = wholeTree[id].parent!;
            const parent = wholeTree[parentId];
            const gridrow = parent.width / NUMBER_OF_COLUMNS;
            //update store
            store
                .getState()
                .moveNodeIntoGrid(id as string, { x: x / gridrow, y: y / 5 });
        }
        store.getState().setOverNode(null);
    };
    useEffect(() => {
        const handleMouseMove = () => {
            // const dom = wholeTree.root.dom;
            // if (!dom) return;
            // const boundingRect = dom.getBoundingClientRect();
            // const x = boundingRect.left;
            // const y = boundingRect.top;
            // setMousePos({ x: e.clientX - x, y: e.clientY - y });
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
                    store
                        .getState()
                        .setOverNode((e.over?.id as string) ?? null);
                }}
                onDragEnd={handleDragEnd}
                onDragMove={(e) => {
                    const mouseStart = getEventCoordinates(e.activatorEvent)!;
                    store.getState().setMousePos({
                        x: mouseStart.x + e.delta.x,
                        y: mouseStart.y + e.delta.y
                    });
                    if (e.active.data.current?.isNew) {
                        const initial = e.active.rect.current.initial!;
                        const [iniX, iniY] = normalizePoint([
                            initial.left,
                            initial.top
                        ]);

                        //  container's displacement + distance dragged + dragged element's initial displacement
                        const [x, y] = normalizePoint([mousePos.x, mousePos.y]);
                        const height = 60;
                        const root = wholeTree.root;

                        const width = Math.min(
                            Math.max(root.width - x, 0),
                            180
                        );
                        setNewNode((prev) => ({
                            ...prev,
                            x,
                            y,
                            width,
                            height
                        }));
                    }
                }}
                onDragStart={(e) => {
                    if (e.active.data.current?.isNew) {
                        setNewNode({
                            type: e.active.data.current.type,
                            id: e.active.data.current.id,
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            isNew: true
                        });
                    }
                }}
                modifiers={[restrictToParentElementUnlessNew, snapModifier]} //todo: may need to change this when we have nested containers and stuff
            >
                <div className="relative h-full w-4/5 bg-gray-900">
                    <WebloomElementShadow />
                    {/*main*/}
                    <WebloomRoot />
                    <Grid gridSize={wholeTree['root'].width / 32} />
                </div>
                {/*sidebar*/}
                <div
                // style={{
                //     top: newNode?.y,
                //     left: newNode?.x,
                //     position: 'absolute',
                //     zIndex: 1000,
                //     backgroundColor: 'black',
                //     width: newNode?.width,
                //     height: newNode?.height
                // }}
                ></div>
                <div className="h-full w-1/5 bg-gray-200">
                    {Object.entries(WebloomComponents).map(
                        ([name, component]) => {
                            return (
                                <NewNodeAdapter type={name} key={name}>
                                    {component.component(
                                        component.initialProps
                                    )}
                                </NewNodeAdapter>
                            );
                        }
                    )}
                </div>
            </DndContext>
        </div>
    );
}

export default App;
