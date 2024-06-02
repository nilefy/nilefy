import { editorStore } from '@/lib/Editor/Models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WebloomWidgets } from '..';
import { NewNodeAdapter } from '../lib';
import { commandManager } from '@/actions/CommandManager';
import { DeleteAction } from '@/actions/editor/Delete';
import { observer } from 'mobx-react-lite';
import { WidgetConfigPanel } from './configInspector';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { matchSorter } from 'match-sorter';
import { Input } from '@/components/ui/input';
import { useSize } from '@/lib/Editor/hooks';
function InsertTab() {
  const [search, setSearch] = useState('');
  const filteredWidgetsKeys = useMemo(() => {
    return matchSorter(Object.keys(WebloomWidgets), search);
  }, [search]);
  return (
    <TabsContent value="insert">
      <div className="w- flex h-full w-full flex-col gap-3 py-4 ">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
        />
        <div
          className="grid min-w-full gap-2"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          }}
        >
          {filteredWidgetsKeys.map((name) => {
            const config =
              WebloomWidgets[name as keyof typeof WebloomWidgets].config;

            const Icon = config.icon;
            return (
              <button
                title={name}
                key={name}
                id={`new-${name}-widget`}
                className=" flex cursor-grab items-center justify-center"
              >
                <NewNodeAdapter
                  type={name as keyof typeof WebloomWidgets}
                  key={name}
                  data-testid={config.name}
                >
                  <div className=" hover:bg-secondary flex w-24 flex-col items-center justify-center gap-2 rounded-sm p-4 ">
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon />
                    </div>
                    <div className="flex h-full w-full items-center justify-center overflow-visible text-ellipsis whitespace-nowrap font-medium leading-3 text-gray-500">
                      {config.name}
                    </div>
                  </div>
                </NewNodeAdapter>
              </button>
            );
          })}
        </div>
      </div>
    </TabsContent>
  );
}

const InspectTab = observer(() => {
  const selectedIdsSize = editorStore.currentPage.selectedNodesSize;
  if (selectedIdsSize === 0) {
    return (
      <TabsContent value="inspect">
        <p>please select item to inspect</p>
      </TabsContent>
    );
  } else if (selectedIdsSize === 1) {
    return (
      <TabsContent value="inspect">
        <WidgetConfigPanel />
      </TabsContent>
    );
  } else if (selectedIdsSize > 1) {
    return (
      <TabsContent value="inspect">
        <p> {selectedIdsSize} components selected</p>
        <Button
          variant={'destructive'}
          onClick={() => commandManager.executeCommand(new DeleteAction())}
        >
          Delete
        </Button>
      </TabsContent>
    );
  }
});

type RightSidebarTabs = 'insert' | 'inspect' | 'page';

export const RightSidebar = observer(() => {
  // i need it to be controlled so i can change it when the selected items count change
  const [openedTab, setOpenedTab] = useState<RightSidebarTabs>('insert');
  const selectedElementsSize = editorStore.currentPage.selectedNodesSize;
  const scrollArea = useRef<HTMLDivElement>(null);
  const bodyDomRect = useSize(document.body) || { height: 0 };
  const scrollAreaY = scrollArea.current?.getBoundingClientRect().y || 0;
  useLayoutEffect(() => {
    if (selectedElementsSize > 0) setOpenedTab('inspect');
    else setOpenedTab('insert');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElementsSize, editorStore.currentPage.firstSelectedWidget]);
  return (
    <div
      className="right-sidebar h-full w-full p-2"
      key="right-sidebar"
      id="right-sidebar"
    >
      <Tabs
        value={openedTab}
        onValueChange={(value) => setOpenedTab(value as RightSidebarTabs)}
        className="h-full w-full"
      >
        <ScrollArea>
          <ScrollBar orientation="horizontal" />
          <TabsList className="flex w-full  gap-2 p-6 leading-4">
            <TabsTrigger value="page">Page</TabsTrigger>
            <TabsTrigger value="inspect">Inspect</TabsTrigger>
            <TabsTrigger value="insert">Insert</TabsTrigger>
          </TabsList>
        </ScrollArea>
        <div className="h-full" ref={scrollArea}>
          <ScrollArea
            style={{
              height: bodyDomRect.height - scrollAreaY,
            }}
            scrollAreaViewPortClassName="h-full w-full px-3 pt-2 [&>div]:!block"
          >
            <InsertTab />
            <InspectTab />
            <TabsContent value="page">show page meta data</TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
});
