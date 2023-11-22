import store from '@/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebloomComponents } from '../WebloomComponents';
import NewNodeAdapter from '../WebloomComponents/lib/NewNodeAdapter';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { commandManager } from '@/Actions/CommandManager';
import { DeleteAction } from '@/Actions/Editor/Delete';

function InsertTab() {
  return (
    <TabsContent value="insert">
      {Object.entries(WebloomComponents).map(([name, component]) => {
        const Component = component.component;
        return (
          <NewNodeAdapter type={name} key={name}>
            <div>{component.name}</div>
          </NewNodeAdapter>
        );
      })}
    </TabsContent>
  );
}

function InspectTab() {
  const selectedIds = store((state) => state.selectedNodeIds);

  if (selectedIds.size === 0) {
    return (
      <TabsContent value="inspect">
        <p>please select item to inspect</p>
      </TabsContent>
    );
  } else if (selectedIds.size === 1) {
    return (
      <TabsContent value="inspect">
        <p>TODO: render form elements based on the component type</p>
      </TabsContent>
    );
  } else if (selectedIds.size > 1) {
    return (
      <TabsContent value="inspect">
        <p> {selectedIds.size} components selected</p>
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
  const { size } = store((state) => state.selectedNodeIds);

  useEffect(() => {
    if (size > 0) setOpenedTab('inspect');
    else setOpenedTab('insert');
  }, [size]);

  return (
    <div className="h-full w-1/5 overflow-y-auto">
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
        <InsertTab />
        <InspectTab />
        <TabsContent value="page">show page meta data</TabsContent>
      </Tabs>
    </div>
  );
}