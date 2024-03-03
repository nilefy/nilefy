import { editorStore } from '@/lib/Editor/Models';
import { Input } from '@/components/ui/input';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { observer } from 'mobx-react-lite';
import EntityForm from '@/components/rjsf_shad/entityForm';
import { ScrollArea } from '@/components/ui/scroll-area';

function ConfigPanelHeader({ node }: { node: WebloomWidget }) {
  if (!node) return null;
  return (
    <div className="flex items-center justify-center">
      <Input
        value={node.id}
        onBlur={(_e) => {
          // TODO: re-enable(user should be able to change entity name)
          // commandManager.executeCommand(
          //   new ChangePropAction(node.id, true, 'name', e.currentTarget.value),
          // );
        }}
      />
    </div>
  );
}

export const ConfigPanel = observer(() => {
  const selectedId = editorStore.currentPage.firstSelectedWidget;
  const selectedNode = editorStore.currentPage.getWidgetById(selectedId);

  return (
    <div className="w-full">
      <ConfigPanelHeader node={selectedNode} />
      <EntityForm entityId={selectedId} />
    </div>
  );
});
