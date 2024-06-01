import { editorStore } from '@/lib/Editor/Models';
import { EntityInspectorConfig } from '@/lib/Editor/interface';
import { observer } from 'mobx-react-lite';
import { WebloomWidgets } from '..';
import { DefaultSection, EntityForm } from '../entityForm';
import { ChangeEvent, useCallback, useState } from 'react';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowRight } from 'lucide-react';
import { singularOrPlural } from '@/lib/utils';
import { commandManager } from '@/actions/CommandManager';
import { RemoteSelectEntity } from '@/actions/editor/remoteSelectEntity';
import { useAutoRun } from '@/lib/Editor/hooks';
import { RenameAction } from '@/actions/editor/Rename';

export const WidgetConfigPanel = observer(() => {
  const selectedId = editorStore.currentPage.firstSelectedWidget;
  const selectedNode = editorStore.currentPage.getWidgetById(selectedId);
  const inspectorConfig = WebloomWidgets[selectedNode.type]
    .inspectorConfig as EntityInspectorConfig;

  return (
    <div className="w-full" data-testid="one-item-inspection-panel">
      <ConfigPanelHeader node={selectedNode} />
      <EntityForm>
        <div className="h-full w-full ">
          <div className="flex flex-col gap-2 ">
            <div className="h-full divide-y-2 divide-gray-200 border-black">
              {inspectorConfig.map((section) => {
                return (
                  <DefaultSection
                    key={section.sectionName}
                    section={section}
                    selectedId={selectedId}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </EntityForm>
    </div>
  );
});

const ConfigPanelHeader = observer(({ node }: { node: WebloomWidget }) => {
  const [value, setValue] = useState(node.id);
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue],
  );
  useAutoRun(() => {
    setValue(node.id);
  });
  if (!node) return null;
  const incoming = node.connections.dependencies || [];
  const outgoing = node.connections.dependents || [];
  const selectCallback = useCallback((id: string) => {
    commandManager.executeCommand(new RemoteSelectEntity(id));
  }, []);
  return (
    <div className="flex flex-col items-start justify-center gap-1">
      <div className="flex w-full justify-between px-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-between gap-2">
            <ArrowRight />
            <span className="font-semibold">{` ${
              incoming.length
            } ${singularOrPlural(
              incoming.length,
              'entity',
              'entities',
            )}`}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Incoming connections</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {incoming.map((id) => {
              return (
                <DropdownMenuItem
                  key={id}
                  className="cursor-pointer"
                  onClick={() => {
                    selectCallback(id);
                  }}
                >
                  {id}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center justify-between gap-2">
            <ArrowRight />
            <span className="font-semibold">{` ${
              outgoing.length
            } ${singularOrPlural(
              outgoing.length,
              'entity',
              'entities',
            )}`}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Outgoing connections</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {outgoing.map((id) => {
              return (
                <DropdownMenuItem
                  className="cursor-pointer"
                  key={id}
                  onClick={() => {
                    selectCallback(id);
                  }}
                >
                  {id}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Label className="text-sm font-medium text-gray-600" htmlFor="name">
        Name
      </Label>
      <Input
        value={value}
        onChange={onChange}
        onBlur={(e) => {
          try {
            commandManager.executeCommand(
              new RenameAction(node.id, e.target.value),
            );
            editorStore.currentPage
              .getWidgetById(node.id)
              .setId(e.target.value);
          } catch {
            e.target.value = node.id;
          }
        }}
      />
    </div>
  );
});
