import store from '@/store';
import { WebloomWidgets, WidgetTypes } from '..';
import { InspectorFormControls } from './formControls';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { createContext, useCallback, useMemo, useState } from 'react';
export const ConfigPanel = () => {
  const selectedId = store((state) => {
    const selectedIds = [...state.selectedNodeIds];
    return selectedIds[0];
  });
  const selectedNode = store.getState().tree[selectedId];
  const inspectorConfig = WebloomWidgets[selectedNode.type].inspectorConfig;

  return inspectorConfig.map((section) => {
    return (
      <InspectorSection
        key={section.sectionName}
        section={section}
        selectedId={selectedId}
      />
    );
  });
};

const InspectorSection = (props: {
  section: (typeof WebloomWidgets)[WidgetTypes]['inspectorConfig'][number];
  selectedId: string;
}) => {
  const { section, selectedId } = props;
  const [opened, setOpened] = useState(true);
  return (
    <Collapsible
      open={opened}
      onOpenChange={setOpened}
      className="space-y-2"
      key={section.sectionName}
    >
      <div className="flex items-center justify-between space-x-4">
        <h4 className="text-sm font-semibold">{section.sectionName}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {opened ? <ChevronDown /> : <ChevronUp />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-5">
        {section.children.map((control) => {
          return (
            <FormControl
              key={control.id}
              control={control}
              selectedId={selectedId}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};
export const FormControlContext = createContext<{
  onChange: (newValue: unknown) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({} as any);
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
      store.getState().setProp(selectedId, control.key, newValue);
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
