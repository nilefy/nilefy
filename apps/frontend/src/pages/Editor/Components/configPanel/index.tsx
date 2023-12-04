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
import { useState } from 'react';

export const ConfigPanel = () => {
  const selected = store((state) => state.selectedNodeIds);
  const selectedId = [...selected][0];
  const selectedNode = store.getState().tree[selectedId];
  const selectedNodeProps = store(
    (state) => state.tree[selectedId].widget.props,
  );
  const inspectorConfig =
    WebloomWidgets[selectedNode.widget.type].inspectorConfig;

  return inspectorConfig.map((section) => {
    return (
      <InspectorSection
        key={section.sectionName}
        section={section}
        selectedId={selectedId}
        selectedNodeProps={selectedNodeProps}
      />
    );
  });
};

const InspectorSection = (props: {
  section: (typeof WebloomWidgets)[WidgetTypes]['inspectorConfig'][number];
  selectedId: string;
  selectedNodeProps: Record<string, unknown>;
}) => {
  const { section, selectedId, selectedNodeProps } = props;
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
          const Component = InspectorFormControls[control.type];
          const options = {
            ...control,
            ...control.options,
            value: selectedNodeProps[control.key],
          };
          const onChange = (newValue: unknown) => {
            store.getState().setProp(selectedId, control.key, newValue);
          };
          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            <Component {...options} onChange={onChange} key={control.id} />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};
