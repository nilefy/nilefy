import { InspectorFormControls } from './formControls';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';

type GenericConfig = WidgetInspectorConfig<Record<string, unknown>>;
export type ConfigFormGenricOnChange = (key: string, newValue: unknown) => void;

const InspectorSection = (props: {
  section: GenericConfig[number];
  itemProps: Record<string, unknown>;
  onChange: ConfigFormGenricOnChange;
}) => {
  const { section, itemProps, onChange } = props;
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
            value: itemProps[control.key],
          };
          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            <Component
              {...options}
              onChange={(newValue) => {
                onChange(control.key, newValue);
              }}
              key={control.id}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ConfigForm = ({
  config: inspectorConfig,
  onChange,
  itemProps,
}: {
  config: GenericConfig;
  onChange: ConfigFormGenricOnChange;
  itemProps: Record<string, unknown>;
}) => {
  return inspectorConfig.map((section) => {
    return (
      <InspectorSection
        key={section.sectionName}
        section={section}
        itemProps={itemProps}
        onChange={onChange}
      />
    );
  });
};
