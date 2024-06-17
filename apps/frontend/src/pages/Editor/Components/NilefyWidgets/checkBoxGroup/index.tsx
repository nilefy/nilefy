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

export type NilefyCheckBoxGroupProps = {
  options: selectOptions[];
  label: string;
  value?: selectOptions[];
  onChange: string;
  disabled: boolean;
};

const NilefyCheckBoxGroup = observer(function NilefyCheckBoxGroup() {
  const { id, onPropChange } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as NilefyCheckBoxGroupProps;

  return (
    <div className="w-full">
      <Label>{props.label}</Label>
      {props.options.map((option: selectOptions) => (
        <div
          className="m-2 flex items-center space-x-2 align-middle"
          key={option.value}
        >
          <Checkbox
            disabled={props.disabled}
            checked={
              props.value?.map((v) => v.value).includes(option.value) ?? false
            }
            onCheckedChange={(checked) => {
              checked
                ? onPropChange({
                    key: 'value',
                    value: [...(props.value ?? []), option],
                  })
                : onPropChange({
                    key: 'value',
                    value:
                      props.value?.filter(
                        (value) => value.value !== option.value,
                      ) ?? [],
                  });
              // execute user defined eventhandlers
              widget.handleEvent('onChange');
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
  icon: ListChecks,
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
    setValue: {
      name: 'setValue',
      path: 'value',
      type: 'SETTER',
    },
  },
};

const initialProps: NilefyCheckBoxGroupProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Check Box Group',
  value: [],
  disabled: false,
  onChange: '',
};

const inspectorConfig: EntityInspectorConfig<NilefyCheckBoxGroupProps> = [
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

export const NilefyCheckBoxGroupWidget: Widget<NilefyCheckBoxGroupProps> = {
  component: NilefyCheckBoxGroup,
  config,
  initialProps,
  inspectorConfig,
  publicAPI: {
    value: {
      description: 'Value of the checkbox group',
      type: 'static',
      typeSignature: 'array<{value: string; label: string}>',
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
      description: 'set the checkbox group options programmatically',
      args: [
        {
          name: 'options',
          type: 'array<{value: string; label: string;}>',
        },
      ],
    },
    setValue: {
      type: 'function',
      description: 'set the checkbox group value programmatically',
      args: [
        {
          name: 'value',
          type: 'array<{value: string; label: string;}>',
        },
      ],
    },
  },
  metaProps: new Set(['value']),
};

export { NilefyCheckBoxGroup };
