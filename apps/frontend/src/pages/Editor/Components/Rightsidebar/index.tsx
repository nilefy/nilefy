import { editorStore } from '@/lib/Editor/Models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLayoutEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WebloomWidgets } from '..';
import { NewNodeAdapter } from '../lib';
import { ConfigPanel } from '../configPanel/index';
import { commandManager } from '@/Actions/CommandManager';
import { DeleteAction } from '@/Actions/Editor/Delete';
import { observer } from 'mobx-react-lite';
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
      <div className="grid w-full  grid-cols-2 gap-2">
        {filteredWidgetsKeys.map((name) => {
          const config =
            WebloomWidgets[name as keyof typeof WebloomWidgets].config;
          return (
            <NewNodeAdapter
              type={name as keyof typeof WebloomWidgets}
              key={name}
              data-testid={config.name}
            >
              <div>
                <div className="flex h-full w-full items-center justify-center">
                  {config.icon}
                </div>
                <div className="flex h-full w-full items-center justify-center">
                  {config.name}
                </div>
              </div>
            </NewNodeAdapter>
          );
        })}
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
        <ConfigPanel />
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
        <TabsList className="w-full">
          <TabsTrigger value="page">Page</TabsTrigger>
          <TabsTrigger value="inspect">Inspect</TabsTrigger>
          <TabsTrigger value="insert">Insert</TabsTrigger>
        </TabsList>
        <div className="p-2">
          <InsertTab />
          <InspectTab />
          <TabsContent value="page">show page meta data</TabsContent>
        </div>
      </Tabs>
    </div>
  );
});
