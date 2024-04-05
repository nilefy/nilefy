import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
  selectOptions,
} from '@/lib/Editor/interface';
import { CircleDot } from 'lucide-react';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export type WebloomRadioProps = {
  options: selectOptions[];
  label: string;
  value: string;
};

const WebloomRadio = observer(() => {
  const { id, onPropChange } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomRadioProps;
  return (
    <div className="w-full">
      <Label>{props.label}</Label>
      <RadioGroup
        value={props.value}
        loop={true}
        onValueChange={(e) => {
          onPropChange({
            key: 'value',
            value: e,
          });
          // execute user defined actions
          // editorStore.executeActions(id, 'change');
        }}
      >
        {props.options.map((option: selectOptions) => (
          <div className="flex items-center space-x-2" key={option.value}>
            <RadioGroupItem value={option.value} />
            <Label htmlFor={option.value}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Radio',
  icon: <CircleDot />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomRadioProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Radio',
  value: 'Option 1',
};

const inspectorConfig: EntityInspectorConfig<WebloomRadioProps> = [
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

export const WebloomRadioWidget: Widget<WebloomRadioProps> = {
  component: WebloomRadio,
  config,
  defaultProps,
  inspectorConfig,
  publicAPI: new Set(['value']),
  metaProps: new Set(['value']),
};

export { WebloomRadio };
