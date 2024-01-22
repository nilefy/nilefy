import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { WebloomWidgets, WidgetTypes } from '..';
import { InspectorFormControls } from '@/components/configForm/formControls';
import { FormControlContext, FormSectionView } from '@/components/configForm';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { commandManager } from '@/Actions/CommandManager';
import { ChangePropAction } from '@/actions/Editor/changeProps';
import { Input } from '@/components/ui/input';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { observer } from 'mobx-react-lite';

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

export const ConfigPanel = observer(() => {
  const selectedId = editorStore.currentPage.firstSelectedWidget;
  const selectedNode = editorStore.currentPage.getWidgetById(selectedId);
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
});

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
  const prop =
    editorStore.currentPage.getWidgetById(selectedId).props[control.key];
  // const prop = store((state) => state.tree[selectedId].props[control.key]);
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
        new ChangePropAction(selectedId, control.key, newValue),
      );
    },
    [control.key, selectedId],
  );
  const contextValue = useMemo(
    () => ({ onChange, id: selectedId, toProperty: control.key }),
    [onChange, selectedId, control.key],
  );
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
