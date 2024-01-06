import Selecto from 'react-selecto';
import React, {
  createElement,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  ElementType,
  useCallback,
  Suspense,
} from 'react';
import throttle from 'lodash/throttle';
import { useHotkeys } from 'react-hotkeys-hook';
import store, { WebloomTree } from '../../store';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
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
import { EDITOR_CONSTANTS } from '@/lib/Editor/constants';
import {
  Grid,
  MultiSelectBounding,
  ResizeHandlers,
  WebloomAdapter,
  WebloomElementShadow,
} from './Components/lib';
import { commandManager } from '@/Actions/CommandManager';
import DragAction from '@/Actions/Editor/Drag';
import { normalize } from '@/lib/Editor/utils';
import { SelectionAction } from '@/Actions/Editor/selection';
import { RightSidebar } from './Components/Rightsidebar/index';
import { WebloomWidgets, WidgetContext } from './Components';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Await, defer, redirect, useLoaderData } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { getToken, removeToken } from '@/lib/token.localstorage';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/auth.types';
import { AppCompleteT, useAppQuery } from '@/api/apps.api';
import { Loader } from 'lucide-react';
import { DeleteAction } from '@/Actions/Editor/Delete';
import { EditorLeftSidebar } from './editorLeftSidebar';
import { QueryPanel } from '@/components/queryPanel';
import { seedNameMap } from '@/store/widgetName';

const { resizeCanvas } = store.getState();
const throttledResizeCanvas = throttle(
  (width: number) => {
    store.getState().setEditorDimensions({ width: Math.round(width) });
  },
  100,
  {
    leading: true,
  },
);
function WebloomRoot() {
  const props = store(
    (state) => state.tree[EDITOR_CONSTANTS.ROOT_NODE_ID].props,
  );
  const nodes = store(
    (state) => state.tree[EDITOR_CONSTANTS.ROOT_NODE_ID].nodes,
  );
  const ref = React.useRef<HTMLDivElement>(null);
  const width = store((state) => state.editorWidth);
  const height = store((state) => state.editorHeight);
  const children = useMemo(() => {
    let children = props.children as React.ReactElement[];
    if (nodes.length > 0) {
      children = nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [nodes, props.children]);
  useLayoutEffect(() => {
    const columnWidth = width / EDITOR_CONSTANTS.NUMBER_OF_COLUMNS;
    let rowsCount =
      store.getState().tree[EDITOR_CONSTANTS.ROOT_NODE_ID].rowsCount;
    if (rowsCount === 0) {
      store
        .getState()
        .setEditorDimensions({ height: ref.current?.clientHeight });
      rowsCount = Math.round(
        ref.current!.clientHeight / EDITOR_CONSTANTS.ROW_HEIGHT,
      );
    }

    resizeCanvas(EDITOR_CONSTANTS.ROOT_NODE_ID, { columnWidth, rowsCount });
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
    store.getState().setEditorDimensions({ width, height });
  };

  return (
    <div id="webloom-root" className="relative h-screen w-full" ref={ref}>
      <WebloomAdapter droppable id={EDITOR_CONSTANTS.ROOT_NODE_ID}>
        <Grid id={EDITOR_CONSTANTS.ROOT_NODE_ID} />
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
  const props = store((state) => state.tree[id].props);
  const onPropChange = useCallback(
    ({ value, key }: { value: unknown; key: string }) => {
      store.getState().setProp(id, key, value);
    },
    [id],
  );
  const children = useMemo(() => {
    let children = props.children as React.ReactElement[];
    if (nodes.length > 0) {
      children = nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [nodes, props.children]);
  const contextValue = useMemo(() => {
    return {
      onPropChange,
      id,
    };
  }, [onPropChange, id]);
  const rendered = useMemo(
    () => (
      <WidgetContext.Provider value={contextValue}>
        {createElement(
          WebloomWidgets[tree.type].component as ElementType,
          props,
          children,
        )}
      </WidgetContext.Provider>
    ),
    [tree.type, props, children, contextValue],
  );
  if (id === EDITOR_CONSTANTS.PREVIEW_NODE_ID) return null;
  return (
    <WebloomAdapter draggable droppable resizable key={id} id={id}>
      {tree.isCanvas && <Grid id={id} />}
      {rendered}
    </WebloomAdapter>
  );
}

const initTree: WebloomTree = {
  [EDITOR_CONSTANTS.ROOT_NODE_ID]: {
    id: EDITOR_CONSTANTS.ROOT_NODE_ID,
    name: EDITOR_CONSTANTS.ROOT_NODE_ID,
    col: 0,
    row: 0,
    columnWidth: 0,
    columnsCount: EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
    nodes: [],
    parent: EDITOR_CONSTANTS.ROOT_NODE_ID,
    isCanvas: true,
    dom: null,
    rowsCount: 0,
    props: {
      className: 'h-full w-full',
    },
    type: 'WebloomContainer',
  },
};
// store.setState((state) => {
//   state.tree = initTree;
//   return state;
// });

const CustomPanelResizeHandle = () => {
  return (
    <PanelResizeHandle className="group relative flex shrink-0 grow-0 basis-1 items-stretch justify-stretch overflow-visible outline-none">
      <div
        className="relative
        flex-1
        transition-colors
        after:absolute
        after:left-[calc(50%-0.5rem)]
        after:top-[calc(50%-.5rem)]
        after:flex after:h-1
        after:w-1
        after:items-center
        after:justify-center
      group-data-[resize-handle-active]:bg-sky-500"
      ></div>
    </PanelResizeHandle>
  );
};

export const appLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Record<string, string | undefined> }) => {
    // as this loader runs before react renders we need to check for token first
    const token = getToken();
    if (!token) {
      return redirect('/signin');
    } else {
      // check is the token still valid
      // Decode the token
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        removeToken();
        return redirect('/signin');
      }
      const query = useAppQuery({
        workspaceId: +(params.workspaceId as string),
        appId: +(params.appId as string),
      });
      return defer({
        app: queryClient.fetchQuery(query),
      });
    }
  };

function EditorLoader() {
  return (
    <div className="flex h-full w-full  items-center justify-center ">
      <Loader className="animate-spin " size={30} />
    </div>
  );
}

export function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);
  useHotkeys('ctrl+z', () => {
    commandManager.undoCommand();
  });
  useHotkeys('delete', () => {
    commandManager.executeCommand(new DeleteAction());
  });
  const draggedNode = store((state) => state.draggedNode);
  const mousePos = useRef({ x: 0, y: 0 });
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: EDITOR_CONSTANTS.ROW_HEIGHT,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      distance: EDITOR_CONSTANTS.ROW_HEIGHT,
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
      const [gridrow] = store
        .getState()
        .getGridSize(EDITOR_CONSTANTS.ROOT_NODE_ID);
      let x = 0;
      const root = store.getState().tree[EDITOR_CONSTANTS.ROOT_NODE_ID];
      const rootBoundingRect = root.dom!.getBoundingClientRect();
      if (mousePos.current.x > rootBoundingRect.width / 2) {
        x = EDITOR_CONSTANTS.NUMBER_OF_COLUMNS - 2;
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
            parent: EDITOR_CONSTANTS.ROOT_NODE_ID,
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
      const rootDom = store.getState().tree[EDITOR_CONSTANTS.ROOT_NODE_ID].dom;
      if (!rootDom) return;
      const boundingRect = rootDom.getBoundingClientRect();
      const x = boundingRect.left;
      const y = boundingRect.top;

      mousePos.current = { x: e.pageX - x, y: e.pageY - y };
    };

    window.addEventListener('pointermove', handleMouseMove);
    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
    };
  }, [draggedNode]);

  return (
    <>
      <div className="isolate flex h-full max-h-full w-full bg-transparent">
        <EditorLeftSidebar />
        {/*sidebar*/}
        <DndContext
          key={'editor-dnd-context'}
          id={'editor-dnd-context'}
          collisionDetection={pointerWithin}
          sensors={sensors}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragMove={handleDragMove}
          onDragCancel={handleCancel}
          autoScroll={{ layoutShiftCompensation: false }}
        >
          <PanelGroup direction="horizontal">
            <Panel
              defaultSizePercentage={70}
              minSizePercentage={50}
              onResize={(sizes) => {
                throttledResizeCanvas(sizes.sizePixels);
              }}
            >
              <PanelGroup direction="vertical">
                <Panel defaultSizePercentage={90} minSizePercentage={25}>
                  <ScrollArea
                    ref={editorRef}
                    className="h-full w-full"
                    scrollAreaViewPortClassName="bg-primary/20 relative touch-none"
                  >
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
                        return isRoot === EDITOR_CONSTANTS.ROOT_NODE_ID;
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
                              return new Set(
                                [...prev].filter((i) => i !== data),
                              );
                            });
                          }
                        });
                      }}
                    />
                    {/** todo: maybe only use the overlay instead of also having drop shadow in the future but for now this'll do */}
                    <DragOverlay
                      key={'drag-overlay'}
                      style={{ display: 'none' }}
                      dropAnimation={{ duration: 0 }}
                    />
                  </ScrollArea>
                </Panel>
                <CustomPanelResizeHandle />
                <Panel
                  maxSizePercentage={75}
                  defaultSizePercentage={10}
                  collapsible
                >
                  <QueryPanel />
                </Panel>
              </PanelGroup>
            </Panel>
            <CustomPanelResizeHandle />
            <Panel maxSizePercentage={25} minSizePercentage={10}>
              <RightSidebar />
            </Panel>
          </PanelGroup>
        </DndContext>
      </div>
    </>
  );
}

export function App() {
  const { app } = useLoaderData();
  return (
    <Suspense fallback={<EditorLoader />}>
      <Await resolve={app} errorElement={<p>Error loading app</p>}>
        {(app) => {
          const a = app as AppCompleteT;
          const tree = a.defaultPage.tree;
          seedNameMap(Object.values(tree));
          // connect to ws
          commandManager.connectToEditor(a.id, a.defaultPage.id);
          // depends on root be with the name 'ROOT'
          EDITOR_CONSTANTS.ROOT_NODE_ID = Object.values(tree).find(
            (c) => c.name === 'ROOT',
          )!.id;
          store.setState((state) => {
            state.tree = tree;
            return state;
          });
          return <Editor />;
        }}
      </Await>
    </Suspense>
  );
}
