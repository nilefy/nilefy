import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Widget, WidgetConfig, SelectOptions } from '@/lib/Editor/interface';
import { CheckSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useCallback, useContext, useEffect } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import { ToolTipWrapper } from '../tooltipWrapper';
import {
  WidgetsEventHandler,
  genEventHandlerUiSchema,
  widgetsEventHandlerJsonSchema,
} from '@/components/rjsf_shad/eventHandler';
import clsx from 'clsx';
import { autorun } from 'mobx';

export type WebloomSelectProps = {
  options: SelectOptions[];
  label: {
    text: string;
    position: 'left' | 'top';
  };
  selectedOptionValue?: string;
  defaultValue?: string;
  disabled?: boolean;
  tooltip?: string;
  placeholder?: string;
  events: WidgetsEventHandler;
};

// https://www.radix-ui.com/primitives/docs/components/select#root
const webloomSelectEvents = {
  onOptionChange: 'onOptionChange',
  onOpenChange: 'onOpenChange',
} as const;

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
          key: 'selectedOptionValue',
          value: props.defaultValue,
        });
      }),
    [onPropChange],
  );
  const clearValue = useCallback(() => {
    onPropChange({
      key: 'selectedOptionValue',
      value: undefined,
    });
  }, [onPropChange]);

  // append runtime methods
  useEffect(() => {
    widget.appendSetters([
      {
        key: 'clearValue',
        setter: clearValue,
      },
    ]);
  }, [clearValue]);

  /**
   * why do i set the key to this weird `id + props.selectedOptionValue`?
   * when clearValue is triggred but the value was set before radix select don't re-show the placeholder
   * the workaround is to make react re-render the component when value changes from string back to undefined, so the component show the placeholder
   * @link https://github.com/radix-ui/primitives/issues/1569
   */
  return (
    <ToolTipWrapper text={props.tooltip} key={id + props.selectedOptionValue}>
      <div
        className={clsx('justify-left flex h-full w-full gap-3 p-1', {
          'flex-col': props.label.position === 'top',
          'items-center': props.label.position === 'left',
        })}
      >
        <Label>{props.label.text}</Label>
        <Select
          value={props.selectedOptionValue}
          disabled={props.disabled}
          onValueChange={(e) => {
            onPropChange({
              key: 'selectedOptionValue',
              value: e,
            });
            editorStore.executeActions<typeof webloomSelectEvents>(
              id,
              'onOptionChange',
            );
          }}
          onOpenChange={() => {
            editorStore.executeActions<typeof webloomSelectEvents>(
              id,
              'onOpenChange',
            );
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
  icon: <CheckSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomSelectProps = {
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  label: { text: 'Select', position: 'left' },
  events: [],
  placeholder: 'please select option',
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      label: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            default: defaultProps.label.text,
          },
          position: {
            type: 'string',
            enum: ['top', 'left'],
            default: defaultProps.label.position,
          },
        },
        required: ['text', 'position'],
      },
      options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
            },
            label: {
              type: 'string',
            },
          },
        },
      },
      defaultValue: {
        type: 'string',
      },
      placeholder: {
        type: 'string',
      },
      tooltip: { type: 'string' },
      disabled: { type: 'boolean', default: false },
      events: widgetsEventHandlerJsonSchema,
      selectedOptionValue: {
        type: 'string',
      },
    },
    required: ['label', 'options'],
  },
  uiSchema: {
    selectedOptionValue: { 'ui:widget': 'hidden' },
    label: {
      text: {
        'ui:widget': 'inlineCodeInput',
        'ui:title': 'Label',
        'ui:placeholder': 'Enter label',
      },
    },
    options: {
      'ui:widget': 'inlineCodeInput',
    },
    defaultValue: { 'ui:widget': 'inlineCodeInput' },
    disabled: {
      'ui:widget': 'inlineCodeInput',
    },
    tooltip: {
      'ui:widget': 'inlineCodeInput',
    },
    placeholder: {
      'ui:widget': 'inlineCodeInput',
    },
    events: genEventHandlerUiSchema(webloomSelectEvents),
  },
};

export const WebloomSelectWidget: Widget<WebloomSelectProps> = {
  component: WebloomSelect,
  config,
  defaultProps,
  schema,
  setters: {
    setValue: {
      path: 'selectedOptionValue',
      type: 'string',
    },
    setDisabled: {
      path: 'disabled',
      type: 'boolean',
    },
    setOptions: {
      path: 'options',
      type: 'array<object>',
    },
  },
};

export { WebloomSelect };
