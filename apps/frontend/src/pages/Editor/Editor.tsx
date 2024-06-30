import { observer } from 'mobx-react-lite';
import { useRef, Suspense, useCallback, useEffect } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { WebloomElementShadow, WebloomRoot } from './Components/lib';
import { commandManager } from '@/actions/CommandManager';
import { RightSidebar } from './Components/Rightsidebar/index';
import { FixedLeftSidebar } from './Components/FixedLeftSidebar';
import { editorStore } from '@/lib/Editor/Models';
import { AppLoader, PageLoader } from './appLoader';
import { NilefyLoader } from '@/components/loader';
import { EditorHeader } from './editorHeader';

import { useSetPageDimensions } from '@/lib/Editor/hooks/useSetPageDimensions';
import { useEditorHotKeys } from '@/lib/Editor/hooks/useEditorHotKeys';
import {
  useConfirmBeforeUnload,
  useInitResizing,
  useMousePosition,
  useOnboarding,
} from '@/lib/Editor/hooks';
import { useThrottle } from '@/lib/Editor/hooks/useThrottle';
import { BottomPanel } from './Components/BottomPanel';
import { LeftSidebar } from './Components/Leftsidebar';
import { Outlet } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { TouchBackend, TouchBackendOptions } from 'react-dnd-touch-backend';
import { runInAction } from 'mobx';

const DndOptions: Partial<TouchBackendOptions> = {
  enableMouseEvents: true,
};
export const EditorLayout = observer(() => {
  const editorRef = useRef<HTMLDivElement>(null);
  useSetPageDimensions(editorRef);
  useEditorHotKeys(editorStore, commandManager);
  useInitResizing();
  useMousePosition();
  useOnboarding(!editorStore.onBoardingCompleted);
  useConfirmBeforeUnload();
  const handleResize = useCallback(() => {
    if (!editorRef.current) return;
    const width = editorRef.current?.clientWidth;
    const height = editorRef.current?.clientHeight;
    editorStore.currentPage.setPageDimensions({ width, height });
  }, [editorRef]);
  const throttledResize = useThrottle(handleResize, 100);
  return (
    <DndProvider backend={TouchBackend} options={DndOptions}>
      <div
        className=" flex h-full max-h-full w-full flex-col bg-transparent"
        style={{
          overflow: 'clip',
        }}
      >
        <div className="h-fit w-full">
          <EditorHeader />
        </div>
        <div className="flex h-full w-full" id="main-editor">
          <FixedLeftSidebar />
          <WebloomElementShadow />

          <ResizablePanelGroup
            onLayout={() => {
              throttledResize();
            }}
            direction="horizontal"
          >
            <ResizablePanel maxSizePercentage={25} minSizePercentage={10}>
              <div>
                <Suspense fallback={<NilefyLoader />}>
                  <LeftSidebar />
                </Suspense>
              </div>
            </ResizablePanel>
            <ResizableHandle />

            <ResizablePanel defaultSizePercentage={70} minSizePercentage={50}>
              <ResizablePanelGroup
                onLayout={() => {
                  throttledResize();
                }}
                direction="vertical"
              >
                <ResizablePanel
                  defaultSizePercentage={65}
                  minSizePercentage={25}
                >
                  <div className="h-full w-full  border-gray-200 p-4">
                    <div
                      ref={editorRef}
                      className="relative h-full w-full bg-slate-50"
                    >
                      <Outlet />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                  maxSizePercentage={75}
                  defaultSizePercentage={35}
                  minSizePercentage={10}
                  collapsible
                  collapsedSizePixels={15}
                  onCollapse={() => {
                    throttledResize();
                  }}
                >
                  <Suspense fallback={<NilefyLoader />}>
                    <BottomPanel />
                  </Suspense>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel maxSizePercentage={25} minSizePercentage={10}>
              <div>
                <Suspense fallback={<NilefyLoader />}>
                  <RightSidebar />
                </Suspense>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </DndProvider>
  );
});

export function App() {
  return (
    <AppLoader initWs={true}>
      <EditorLayout />
    </AppLoader>
  );
}

export const Editor = observer(() => {
  if (editorStore.isLoadingPage) {
    return <NilefyLoader />;
  }
  useEffect(() => {
    runInAction(() => {
      editorStore.environment = 'development';
    });
  }, []);
  return (
    <PageLoader>
      <WebloomRoot isProduction={editorStore.isProduction} />
    </PageLoader>
  );
});
