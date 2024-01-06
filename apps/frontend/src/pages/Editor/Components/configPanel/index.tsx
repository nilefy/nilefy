import store from '@/store';
import { WebloomWidgets, WidgetTypes } from '..';
import { InspectorFormControls } from '@/components/configForm/formControls';
import { FormControlContext, FormSectionView } from '@/components/configForm';
import { useCallback, useMemo } from 'react';
import { commandManager } from '@/Actions/CommandManager';
import { ChangePropAction } from '@/actions/Editor/changeProps';
import { Input } from '@/components/ui/input';
import { WebloomNode } from '@/lib/Editor/interface';

function ConfigPanelHeader({ node }: { node: WebloomNode }) {
  return (
    <div className="flex items-center justify-center">
      <Input
        defaultValue={node.name}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commandManager.executeCommand(
              new ChangePropAction(
                node.id,
                true,
                'name',
                e.currentTarget.value,
              ),
            );
          }
        }}
      />
    </div>
  );
}

export const ConfigPanel = () => {
  const selectedId = store((state) => {
    const selectedIds = [...state.selectedNodeIds];
    return selectedIds[0];
  });
  const selectedNode = store.getState().tree[selectedId];
  const inspectorConfig = WebloomWidgets[selectedNode.type].inspectorConfig;

  return (
    <div>
      <ConfigPanelHeader node={selectedNode} />
      {inspectorConfig.map((section) => {
        return (
          <InspectorSection
            key={section.sectionName}
            section={section}
            selectedId={selectedId}
          />
        );
      })}
    </div>
  );
};

const InspectorSection = (props: {
  section: (typeof WebloomWidgets)[WidgetTypes]['inspectorConfig'][number];
  selectedId: string;
}) => {
  const { section, selectedId } = props;
  return (
    <FormSectionView sectionName={section.sectionName}>
      {section.children.map((control) => {
        return (
          <FormControl
            key={control.id}
            control={control}
            selectedId={selectedId}
          />
        );
      })}
    </FormSectionView>
  );
};

const FormControl = (props: {
  control: (typeof WebloomWidgets)[WidgetTypes]['inspectorConfig'][number]['children'][number];
  selectedId: string;
}) => {
  const { control, selectedId } = props;
  const Component = InspectorFormControls[control.type];
  const prop = store((state) => state.tree[selectedId].props[control.key]);
  const options = useMemo(
    () => ({
      ...control,
      ...control.options,
      value: prop,
    }),
    [control, prop],
  );
  const onChange = useCallback(
    (newValue: unknown) => {
      commandManager.executeCommand(
        new ChangePropAction(selectedId, false, control.key, newValue),
      );
    },
    [control.key, selectedId],
  );
  const contextValue = useMemo(() => ({ onChange }), [onChange]);
  return (
    <FormControlContext.Provider value={contextValue}>
      {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        <Component {...options} key={control.id} />
      }
    </FormControlContext.Provider>
  );
};
