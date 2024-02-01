import Selecto from 'react-selecto';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, Suspense, useCallback } from 'react';
import throttle from 'lodash/throttle';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
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
import { EDITOR_CONSTANTS } from '@webloom/constants';
import {
  MultiSelectBounding,
  ResizeHandlers,
  WebloomElementShadow,
  WebloomRoot,
} from './Components/lib';
import { commandManager } from '@/Actions/CommandManager';
import DragAction from '@/Actions/Editor/Drag';
import { normalize } from '@/lib/Editor/utils';
import { SelectionAction } from '@/Actions/Editor/selection';
import { RightSidebar } from './Components/Rightsidebar/index';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Await,
  defer,
  redirect,
  useAsyncError,
  useAsyncValue,
  useLoaderData,
} from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { getToken, removeToken } from '@/lib/token.localstorage';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '@/types/auth.types';
import { AppCompleteT, useAppQuery } from '@/api/apps.api';
import { DeleteAction } from '@/Actions/Editor/Delete';
import { EditorLeftSidebar } from './editorLeftSideBar';
import { QueryPanel } from '@/components/queryPanel';
import { seedNameMap } from '@/lib/Editor/widgetName';
import { WebloomPage } from '@/lib/Editor/Models/page';
import { editorStore } from '@/lib/Editor/Models';
import { FetchXError } from '@/utils/fetch';
import { WebloomLoader } from '@/components/loader';

const throttledResizeCanvas = throttle(
  (width: number) => {
    editorStore.currentPage.setPageDimensions({ width: Math.round(width) });
  },
  100,
  {
    leading: true,
  },
);

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

export const Editor = observer(() => {
  const editorRef = useRef<HTMLDivElement>(null);
  useHotkeys('ctrl+z', () => {
    commandManager.undoCommand();
  });

  useHotkeys('delete', () => {
    commandManager.executeCommand(new DeleteAction());
  });

  const draggedNode = editorStore.currentPage.draggedWidgetId;
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

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    if (!e.active.data.current) return;
    const over: string | null = e.over ? (e.over.id as string) : null;
    commandManager.executeCommand(DragAction.end(over));
    editorStore.currentPage.setOverWidgetId(null);
  }, []);

  const handleDragOver = useCallback(
    (e: DragOverEvent) => {
      if (e.active.id === e.over?.id) return;
      editorStore.currentPage.setOverWidgetId((e.over?.id as string) ?? null);
      if (e.active.data.current?.isNew && draggedNode === null) {
        const root = editorStore.currentPage.rootWidget;
        const [gridrow] = root.gridSize;
        let x = 0;
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
    },
    [draggedNode],
  );

  const handleDragMove = useCallback(
    (e: DragMoveEvent) => {
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
      editorStore.currentPage.setMousePosition(mousePos.current);
    },
    [draggedNode],
  );

  const handleCancel = useCallback(() => {
    commandManager.executeCommand(DragAction.cancel());
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: PointerEvent) => {
      const rootDom = editorStore.currentPage.rootWidget.dom;
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
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              defaultSizePercentage={70}
              minSizePercentage={50}
              onResize={(sizes) => {
                throttledResizeCanvas(sizes.sizePixels);
              }}
            >
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel
                  defaultSizePercentage={90}
                  minSizePercentage={25}
                >
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
                            editorStore.currentPage.setSelectedNodeIds(
                              (prev) => {
                                return new Set(
                                  [...prev].filter((i) => i !== data),
                                );
                              },
                            );
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
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel
                  maxSizePercentage={75}
                  defaultSizePercentage={10}
                  collapsible
                >
                  <QueryPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel maxSizePercentage={25} minSizePercentage={10}>
              <Suspense fallback={<div>Loading...</div>}>
                <RightSidebar />
              </Suspense>
            </ResizablePanel>
          </ResizablePanelGroup>
        </DndContext>
      </div>
    </>
  );
});

function AppLoadError() {
  const error = useAsyncError() as FetchXError;
  return (
    <div className="h-screen w-screen content-center items-center text-red-500">
      errors while loading app &quot;{error.message}&quot;
    </div>
  );
}

const AppResolved = function AppResolved() {
  const app = useAsyncValue() as AppCompleteT;
  const tree = app.defaultPage.tree;
  // todo : put the init state inside the editor store itself
  const inited = useRef(false);
  if (!inited.current) {
    seedNameMap(Object.values(tree));
    editorStore.init({
      currentPageId: app.defaultPage.id.toString(),
      pages: [
        new WebloomPage({
          id: app.defaultPage.id.toString(),
          widgets: tree,
          queries: {},
        }),
      ],
    });
    inited.current = true;
  }
  useEffect(() => {
    commandManager.connectToEditor(app.id, app.defaultPage.id);
    return () => {
      commandManager.disconnectFromConnectedEditor();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <Editor />;
};
export function App() {
  const { app } = useLoaderData();

  return (
    <Suspense fallback={<WebloomLoader />}>
      <Await resolve={app} errorElement={<AppLoadError />}>
        <AppResolved />
      </Await>
    </Suspense>
  );
}
