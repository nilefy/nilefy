import { CheckSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Widget,
  WidgetConfig,
  SelectOptions,
  EntityInspectorConfig,
} from '@/lib/Editor/interface';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';

import { ToolTipWrapper } from '../tooltipWrapper';

import clsx from 'clsx';
import { autorun } from 'mobx';
import { useContext, useEffect } from 'react';

export type WebloomSelectProps = {
  options: SelectOptions[];
  labelText: string;
  labelPosition: 'left' | 'top';
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  tooltip?: string;
  placeholder?: string;
};

const WebloomSelect = observer(function WebloomSelect() {
  const { id, onPropChange } = useContext(WidgetContext);

  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as WebloomSelectProps;

  // for defaultValue, i don't think we can use radix-ui's select.defaultValue directly because the component is controlled
  // so the meaning of default value what the value will start with
  useEffect(
    () =>
      autorun(() => {
        onPropChange({
          key: 'value',
          value: props.defaultValue,
        });
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /**
   * why do i set the key to this weird `id + props.value`?
   * when clearValue is triggred but the value was set before radix select don't re-show the placeholder
   * the workaround is to make react re-render the component when value changes from string back to undefined, so the component show the placeholder
   * @link https://github.com/radix-ui/primitives/issues/1569
   */
  return (
    <ToolTipWrapper text={props.tooltip} key={id + props.value}>
      <div
        className={clsx('justify-left flex h-full w-full gap-3 p-1', {
          'flex-col': props.labelPosition === 'top',
          'items-center': props.labelPosition === 'left',
        })}
      >
        <Label>{props.labelText}</Label>
        <Select
          value={props.value}
          disabled={props.disabled}
          onValueChange={(e) => {
            onPropChange({
              key: 'value',
              value: e,
            });
            widget.handleEvent('onOptionChange');
          }}
          onOpenChange={() => {
            widget.handleEvent('onOpenChange');
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={props.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((option: SelectOptions) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ToolTipWrapper>
  );
});

const config: WidgetConfig = {
  name: 'Select',
  icon: CheckSquare,
  isCanvas: false,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
  widgetActions: {
    setValue: {
      type: 'SETTER',
      path: 'value',
      name: 'setValue',
    },
    setDisabled: {
      type: 'SETTER',
      path: 'disabled',
      name: 'setDisabled',
    },
    setOptions: {
      type: 'SETTER',
      path: 'options',
      name: 'setOptions',
    },
    clearValue: {
      type: 'SETTER',
      path: 'value',
      value: undefined,
      name: 'clearValue',
    },
  },
};

const initialProps: WebloomSelectProps = {
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  labelText: 'Select',
  labelPosition: 'left',
  placeholder: 'please select option',
};

const inspectorConfig: EntityInspectorConfig<WebloomSelectProps> = [
  {
    sectionName: 'General',
    children: [
      {
        label: 'Label',
        path: 'labelText',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Label',
        },
      },
      {
        label: 'Label Position',
        path: 'labelPosition',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Label Position',
        },
        validation: zodToJsonSchema(z.enum(['left', 'top']).default('left')),
      },
      {
        label: 'Tooltip',
        path: 'tooltip',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Tooltip',
        },
      },
      {
        label: 'Placeholder',
        path: 'placeholder',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Placeholder',
        },
      },
      {
        label: 'Default Value',
        path: 'defaultValue',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Default Value',
        },
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
    ],
  },
];

export const WebloomSelectWidget: Widget<WebloomSelectProps> = {
  component: WebloomSelect,
  config,
  initialProps,
  inspectorConfig,
  metaProps: new Set(['value']),
};

export { WebloomSelect };
