import { editorStore } from '@/lib/Editor/Models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLayoutEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WebloomWidgets } from '..';
import { NewNodeAdapter } from '../lib';
import { commandManager } from '@/actions/CommandManager';
import { DeleteAction } from '@/actions/Editor/Delete';
import { observer } from 'mobx-react-lite';
import { WidgetConfigPanel } from './configInspector';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DebouncedInput } from '@/components/debouncedInput';
import { matchSorter } from 'match-sorter';

function InsertTab() {
  const [search, setSearch] = useState('');
  const filteredWidgetsKeys = useMemo(() => {
    return matchSorter(Object.keys(WebloomWidgets), search);
  }, [search]);

  return (
    <TabsContent value="insert" className="flex flex-col gap-3">
      <DebouncedInput
        value={search}
        onChange={(val) => setSearch(val.toString())}
        placeholder="Search"
      />
      <ScrollArea>
        <div
          className="grid min-w-full gap-2"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          }}
        >
          {filteredWidgetsKeys.map((name) => {
            const config =
              WebloomWidgets[name as keyof typeof WebloomWidgets].config;
            return (
              <div key={name} className=" flex items-center justify-center  ">
                <NewNodeAdapter
                  type={name as keyof typeof WebloomWidgets}
                  key={name}
                  data-testid={config.name}
                >
                  <div className=" hover:bg-secondary flex w-24 flex-col items-center justify-center gap-2 rounded-sm p-4 ">
                    <div className="flex h-full w-full items-center justify-center">
                      {config.icon}
                    </div>
                    <div className="flex h-full w-full items-center justify-center overflow-visible text-ellipsis whitespace-nowrap font-medium leading-3 text-gray-500">
                      {config.name}
                    </div>
                  </div>
                </NewNodeAdapter>
              </div>
            );
          })}
        </div>
      </ScrollArea>
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

  const size = editorStore.currentPage.selectedNodesSize;

  useLayoutEffect(() => {
    if (size > 0) setOpenedTab('inspect');
    else setOpenedTab('insert');
  }, [size]);

  return (
    <div
      className="right-sidebar h-full w-full overflow-y-auto"
      key="right-sidebar"
    >
      <Tabs
        value={openedTab}
        onValueChange={(value) => setOpenedTab(value as RightSidebarTabs)}
        className="w-full"
      >
        <ScrollArea>
          <ScrollBar orientation="horizontal" />
          <TabsList className="flex w-full justify-start gap-2 p-6 leading-4">
            <TabsTrigger value="page">Page</TabsTrigger>
            <TabsTrigger value="inspect">Inspect</TabsTrigger>
            <TabsTrigger value="insert">Insert</TabsTrigger>
          </TabsList>
        </ScrollArea>
        <div className="p-2">
          <InsertTab />
          <InspectTab />
          <TabsContent value="page">show page meta data</TabsContent>
        </div>
      </Tabs>
    </div>
  );
});
