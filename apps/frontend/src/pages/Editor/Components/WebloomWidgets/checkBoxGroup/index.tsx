import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
  selectOptions,
} from '@/lib/Editor/interface';
import { ListChecks } from 'lucide-react';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';

export type WebloomCheckBoxGroupProps = {
  options: selectOptions[];
  label: string;
  value: selectOptions[];
};

const WebloomCheckBoxGroup = observer(function WebloomCheckBoxGroup() {
  const { id, onPropChange } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomCheckBoxGroupProps;
  return (
    <div className="w-full">
      <Label>{props.label}</Label>
      {props.options.map((option: selectOptions) => (
        <div
          className="m-2 flex items-center space-x-2 align-middle"
          key={option.value}
        >
          <Checkbox
            checked={props.value.includes(option)}
            onCheckedChange={(checked) => {
              checked
                ? onPropChange({
                    key: 'value',
                    value: [...props.value, option],
                  })
                : onPropChange({
                    key: 'value',
                    value: props.value?.filter((value) => value !== option),
                  });
              // execute user defined eventhandlers
              // editorStore.executeActions(id, 'change');
            }}
          />
          <Label>{option.label}</Label>
        </div>
      ))}
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Check Box Group',
  icon: <ListChecks />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const initialProps: WebloomCheckBoxGroupProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Check Box Group',
  value: [],
};

const inspectorConfig: EntityInspectorConfig<WebloomCheckBoxGroupProps> = [
  {
    sectionName: 'General',
    children: [
      {
        label: 'Label',
        path: 'label',
        type: 'inlineCodeInput',
        options: {
          label: 'Label',
        },
      },
      {
        label: 'Options',
        path: 'options',
        type: 'inlineCodeInput',
        options: {
          label: 'Options',
        },
        validation: zodToJsonSchema(
          z
            .array(
              z.object({
                label: z.string(),
                value: z.string(),
              }),
            )
            .default([]),
        ),
      },
    ],
  },
];

export const WebloomCheckBoxGroupWidget: Widget<WebloomCheckBoxGroupProps> = {
  component: WebloomCheckBoxGroup,
  config,
  initialProps,
  inspectorConfig,
  metaProps: new Set(['value']),
};

export { WebloomCheckBoxGroup };
