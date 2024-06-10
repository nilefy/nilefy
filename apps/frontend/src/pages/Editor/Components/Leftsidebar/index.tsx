import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSize } from '@/lib/Editor/hooks';

import { editorStore } from '@/lib/Editor/Models';
import { ComponentTreeItem } from './componentsViewer';
import { PageSelector } from './pageSelector';
import { Libraries } from './libraries';

type LeftSidebarTabs = 'Pages' | 'Libraries' | 'Components';
const PAGES_TAB_KEY: LeftSidebarTabs = 'Pages';
const LIBRARIES_TAB_KEY: LeftSidebarTabs = 'Libraries';
const COMPONENTS_TAB_KEY: LeftSidebarTabs = 'Components';

const ComponentsTab = observer(() => {
  return (
    <TabsContent value={COMPONENTS_TAB_KEY}>
      <div className="flex flex-col">
        {editorStore.currentPage.rootWidget.nodes.map((node) => {
          return <ComponentTreeItem key={node} id={node} />;
        })}
      </div>
    </TabsContent>
  );
});

const PagesTab = observer(() => {
  return (
    <TabsContent value={PAGES_TAB_KEY}>
      <PageSelector />
    </TabsContent>
  );
});

const LibrariesTab = observer(() => {
  return (
    <TabsContent value={LIBRARIES_TAB_KEY}>
      <Libraries />
    </TabsContent>
  );
});
export const LeftSidebar = observer(() => {
  // i need it to be controlled so i can change it when the selected items count change
  const [openedTab, setOpenedTab] = useState<LeftSidebarTabs>('Components');
  const scrollArea = useRef<HTMLDivElement>(null);
  const bodyDomRect = useSize(document.body) || { height: 0 };
  const scrollAreaY = scrollArea.current?.getBoundingClientRect().y || 0;

  return (
    <div
      className="right-sidebar h-full w-full border-l p-2"
      key="right-sidebar"
    >
      <Tabs
        value={openedTab}
        onValueChange={(value) => setOpenedTab(value as LeftSidebarTabs)}
        className="h-full w-full"
      >
        <ScrollArea>
          <ScrollBar orientation="horizontal" />
          <TabsList className="flex w-full  gap-2 p-6 leading-4">
            <TabsTrigger value="Components">Components</TabsTrigger>
            <TabsTrigger value="Pages">Pages</TabsTrigger>
            <TabsTrigger value="Libraries">Libraries</TabsTrigger>
          </TabsList>
        </ScrollArea>
        <div className="h-full" ref={scrollArea}>
          <ScrollArea
            style={{
              height: bodyDomRect.height - scrollAreaY,
            }}
            scrollAreaViewPortClassName="h-full w-full px-3 pt-2 [&>div]:!block"
          >
            <ComponentsTab />
            <PagesTab />
            <LibrariesTab />
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
});
