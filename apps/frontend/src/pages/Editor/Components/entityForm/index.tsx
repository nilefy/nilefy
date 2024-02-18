import { editorStore } from '@/lib/Editor/Models';
import { WebloomWidgets, WidgetTypes } from '..';

import {
  ChangeEvent,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { commandManager } from '@/Actions/CommandManager';
import { ChangePropAction } from '@/Actions/Editor/changeProps';
import { Input } from '@/components/ui/input';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { observer } from 'mobx-react-lite';
import { InspectorFormControls } from './formControls';
import { Collapsible } from '@radix-ui/react-collapsible';
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FormControlContext = createContext<{
  onChange: (newValue: unknown) => void;
  /*
   * entityId
   */
  id?: string;
  toProperty?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({} as any);
export const FormSectionView = (props: {
  children: React.ReactNode;
  sectionName: string;
}) => {
  const { children, sectionName } = props;
  const [opened, setOpened] = useState(true);
  return (
    <Collapsible
      open={opened}
      onOpenChange={setOpened}
      className="h-full w-full space-y-2"
      key={sectionName}
    >
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">{sectionName}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {opened ? <ChevronDown /> : <ChevronUp />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-5">{children}</CollapsibleContent>
    </Collapsible>
  );
};

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

const InspectorSection = observer(
  (props: {
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
  },
);

const FormControl = observer(
  (props: {
    control: (typeof WebloomWidgets)[WidgetTypes]['inspectorConfig'][number]['children'][number];
    selectedId: string;
  }) => {
    const { control, selectedId } = props;
    const Component = InspectorFormControls[control.type];
    const prop = editorStore.currentPage
      .getWidgetById(selectedId)
      .getRawValue(control.key);
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
        console.log('onChange', newValue);
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
  },
);
