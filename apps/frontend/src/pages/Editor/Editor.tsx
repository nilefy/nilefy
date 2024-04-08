import { observer } from 'mobx-react-lite';
import { useRef, Suspense, useCallback } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { WebloomElementShadow, WebloomRoot } from './Components/lib';
import { commandManager } from '@/Actions/CommandManager';
import { RightSidebar } from './Components/Rightsidebar/index';
import { EditorLeftSidebar } from './Components/Leftsidebar';
import { editorStore } from '@/lib/Editor/Models';
import { AppLoader } from './appLoader';
import { WebloomLoader } from '@/components/loader';
import { EditorHeader } from './editorHeader';

import { useSetPageDimensions } from '@/lib/Editor/hooks/useSetPageDimensions';
import { useEditorHotKeys } from '@/lib/Editor/hooks/useEditorHotKeys';
import { useInitResizing, useMousePosition } from '@/lib/Editor/hooks';
import { useThrottle } from '@/lib/Editor/hooks/useThrottle';
import { BottomPanel } from './Components/BottomPanel';

export const Editor = observer(() => {
  const editorRef = useRef<HTMLDivElement>(null);
  useSetPageDimensions(editorRef);
  useEditorHotKeys(editorStore, commandManager);
  useInitResizing();
  useMousePosition();
  const handleResize = useCallback(() => {
    if (!editorRef.current) return;
    const width = editorRef.current?.clientWidth;
    const height = editorRef.current?.clientHeight;
    editorStore.currentPage.setPageDimensions({ width, height });
  }, [editorRef]);
  const throttledResize = useThrottle(handleResize, 100);
  return (
    <div className=" flex h-full max-h-full w-full flex-col overflow-hidden bg-transparent">
      <div className="h-fit w-full">
        <EditorHeader />
      </div>
      <div className="flex h-full w-full">
        <EditorLeftSidebar />
        <WebloomElementShadow />

        <ResizablePanelGroup
          onLayout={() => {
            throttledResize();
          }}
          direction="horizontal"
        >
          <ResizablePanel defaultSizePercentage={70} minSizePercentage={50}>
            <ResizablePanelGroup
              onLayout={() => {
                throttledResize();
              }}
              direction="vertical"
            >
              <ResizablePanel defaultSizePercentage={65} minSizePercentage={25}>
                <div className="h-full w-full border-l border-gray-200 p-4">
                  <div
                    ref={editorRef}
                    className="relative h-full w-full bg-white"
                  >
                    <WebloomRoot isProduction={false} />
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
                <Suspense fallback={<WebloomLoader />}>
                  <BottomPanel />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel maxSizePercentage={25} minSizePercentage={10}>
            <div>
              <Suspense fallback={<WebloomLoader />}>
                <RightSidebar />
              </Suspense>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
});

export function App() {
  return (
    <AppLoader initWs={true}>
      <Editor />
    </AppLoader>
  );
}
