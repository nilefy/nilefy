import { editorStore } from '@/lib/Editor/Models';
import { EntityInspectorConfig } from '@/lib/Editor/interface';
import { observer } from 'mobx-react-lite';
import { WebloomWidgets } from '..';
import { EntityForm, EntityFormControl, FormSectionView } from '../entityForm';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { Input } from '@/components/ui/input';

export const WidgetConfigPanel = observer(() => {
  const selectedId = editorStore.currentPage.firstSelectedWidget;
  const selectedNode = editorStore.currentPage.getWidgetById(selectedId);
  const inspectorConfig = WebloomWidgets[selectedNode.type]
    .inspectorConfig as EntityInspectorConfig;

  return (
    <div>
      <ConfigPanelHeader node={selectedNode} />
      <EntityForm>
        {inspectorConfig.map((section) => {
          return (
            <InspectorSection
              key={section.sectionName}
              section={section}
              selectedId={selectedId}
            />
          );
        })}
      </EntityForm>
    </div>
  );
});

const InspectorSection = observer(
  (props: { section: EntityInspectorConfig[number]; selectedId: string }) => {
    const { section, selectedId } = props;
    return (
      <FormSectionView sectionName={section.sectionName}>
        {section.children.map((control) => {
          const id = `${selectedId}-${control.path}`;
          return (
            <EntityFormControl
              key={id}
              id={id}
              control={control}
              entityId={selectedId}
            />
          );
        })}
      </FormSectionView>
    );
  },
);

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
        onBlur={(e) => {
          // commandManager.executeCommand(
          //   new ChangePropAction(node.id, true, 'name', e.currentTarget.value),
          // );
        }}
      />
    </div>
  );
}
