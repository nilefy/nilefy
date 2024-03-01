import { editorStore } from '@/lib/Editor/Models';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { observer } from 'mobx-react-lite';
import EntityForm from '@/components/rjsf_shad/entityForm';

function ConfigPanelHeader({ node }: { node: WebloomWidget }) {
  const [value, setValue] = useState(node.id);
  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    [setValue],
  );
  useEffect(() => {
    setValue(node.id);
  }, [node.id]);
  if (!node) return null;
  return (
    <div className="flex items-center justify-center">
      <Input
        value={value}
        onChange={onChange}
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
    <div>
      <ConfigPanelHeader node={selectedNode} />
      <EntityForm entityId={selectedId} />
    </div>
  );
});
