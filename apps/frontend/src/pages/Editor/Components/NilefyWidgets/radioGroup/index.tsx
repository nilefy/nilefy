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

export type NilefyRadioProps = {
  options: selectOptions[];
  label: string;
  value: string;
  onChange: string;
  disabled: boolean;
};

const NilefyRadio = observer(() => {
  const { id, onPropChange } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as NilefyRadioProps;
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
          widget.handleEvent('onChange');
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
  icon: CircleDot,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
  widgetActions: {
    setDisabled: {
      name: 'setDisabled',
      path: 'disabled',
      type: 'SETTER',
    },
    setOptions: {
      name: 'setOptions',
      path: 'options',
      type: 'SETTER',
    },
  },
};

const initialProps: NilefyRadioProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Radio',
  value: 'Option 1',
  onChange: '',
  disabled: false,
};

const inspectorConfig: EntityInspectorConfig<NilefyRadioProps> = [
  {
    sectionName: 'General',
    children: [
      {
        label: 'Label',
        path: 'label',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Label',
        },
      },
      {
        label: 'Options',
        path: 'options',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Options',
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
      {
        label: 'Disabled',
        path: 'disabled',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Disabled',
        },
        validation: zodToJsonSchema(z.boolean().default(false)),
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        path: 'onChange',
        label: 'onChange',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'onChange',
        },
        isEvent: true,
      },
    ],
  },
];

export const NilefyRadioWidget: Widget<NilefyRadioProps> = {
  component: NilefyRadio,
  config,
  initialProps,
  inspectorConfig,
  publicAPI: {
    value: {
      description: 'Value of the radio',
      type: 'static',
      typeSignature: 'string',
    },
    setDisabled: {
      type: 'function',
      args: [
        {
          name: 'disabled',
          type: 'boolean',
        },
      ],
    },
    setOptions: {
      type: 'function',
      description: 'set the radio group options programmatically',
      args: [
        {
          name: 'options',
          type: 'array<{value: string; label: string;}>',
        },
      ],
    },
  },
  metaProps: new Set(['value']),
};

export { NilefyRadio };
