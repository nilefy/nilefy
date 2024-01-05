import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WebloomWidgets } from '..';
import { NewNodeAdapter } from '../lib';
import { ConfigPanel } from '../configPanel/index';
import { commandManager } from '@/Actions/CommandManager';
import { DeleteAction } from '@/Actions/Editor/Delete';

function InsertTab() {
  return (
    <TabsContent value="insert">
      <div className="grid w-full  grid-cols-2 gap-2">
        {Object.entries(WebloomWidgets).map(([name]) => {
          const config =
            WebloomWidgets[name as keyof typeof WebloomWidgets].config;
          return (
            <NewNodeAdapter type={name} key={name}>
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

function InspectTab() {
  const selectedIdsSize = editorStore.currentPage.selectedNodeIds.size;
  // const selectedIdsSize = store((state) => state.selectedNodeIds.size);

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
}

type RightSidebarTabs = 'insert' | 'inspect' | 'page';

export function RightSidebar() {
  // i need it to be controlled so i can change it when the selected items count change
  const [openedTab, setOpenedTab] = useState<RightSidebarTabs>('insert');

  const size = editorStore.currentPage.selectedNodeIds.size;
  // const size = store((state) => state.selectedNodeIds.size);

  useEffect(() => {
    if (size > 0) setOpenedTab('inspect');
    else setOpenedTab('insert');
  }, [size]);

  return (
    <div className="h-full w-full overflow-y-auto" key="right-sidebar">
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
}
