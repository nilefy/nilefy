import { observer } from 'mobx-react-lite';
import { useRef, Suspense } from 'react';
import throttle from 'lodash/throttle';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { WebloomElementShadow, WebloomRoot } from './Components/lib';
import { commandManager } from '@/Actions/CommandManager';
import { RightSidebar } from './Components/Rightsidebar/index';
import { EditorLeftSidebar } from './editorLeftSideBar';
import { QueryPanel } from '@/components/queryPanel';
import { editorStore } from '@/lib/Editor/Models';
import { AppLoader } from './appLoader';
import { WebloomLoader } from '@/components/loader';
import { EditorHeader } from './editorHeader';
import { DndProvider } from 'react-dnd';
import { TouchBackend, TouchBackendOptions } from 'react-dnd-touch-backend';

import { useSetPageDimensions } from '@/lib/Editor/hooks/useSetPageDimensions';
import { useEditorHotKeys } from '@/lib/Editor/hooks/useEditorHotKeys';
import { useInitResizing } from '@/lib/Editor/hooks';

const throttledResizeCanvas = throttle(
  (width: number) => {
    editorStore.currentPage.setPageDimensions({ width: Math.round(width) });
  },
  100,
  {
    leading: true,
  },
);
const DndOptions: Partial<TouchBackendOptions> = {
  enableMouseEvents: true,
};
export const Editor = observer(() => {
  const editorRef = useRef<HTMLDivElement>(null);
  useSetPageDimensions(editorRef);
  useEditorHotKeys(editorStore, commandManager);
  useInitResizing();
  return (
    <div className=" flex h-full max-h-full w-full flex-col bg-transparent">
      <div className="h-fit w-full">
        <EditorHeader />
      </div>
      <div className="flex h-full w-full">
        <EditorLeftSidebar />
        <DndProvider backend={TouchBackend} options={DndOptions}>
          <WebloomElementShadow />

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
                  defaultSizePercentage={65}
                  minSizePercentage={25}
                >
                  <div className="h-full w-full border-l border-gray-200 p-4">
                    <div
                      ref={editorRef}
                      className="relative h-full w-full bg-white"
                    >
                      {/* <MultiSelectBounding /> */}
                      <WebloomRoot isPreview={false} />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                  maxSizePercentage={75}
                  defaultSizePercentage={35}
                  collapsible
                >
                  <QueryPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel maxSizePercentage={25} minSizePercentage={10}>
              <Suspense fallback={<WebloomLoader />}>
                <RightSidebar />
              </Suspense>
            </ResizablePanel>
          </ResizablePanelGroup>
        </DndProvider>
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
