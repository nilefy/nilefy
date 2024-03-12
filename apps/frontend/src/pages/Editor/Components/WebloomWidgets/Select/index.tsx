import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Widget, WidgetConfig, selectOptions } from '@/lib/Editor/interface';
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

export type WebloomSelectProps = {
  options: selectOptions[];
  label: string;
  value?: string;
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

  const clearValue = useCallback(() => {
    onPropChange({
      key: 'value',
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
   * why do i set the key to this weird `id + props.value`?
   * when clearValue is triggred but the value was set before radix select don't re-show the placeholder
   * the workaround is to make react re-render the component when value changes from string back to undefined, so the component show the placeholder
   * @link https://github.com/radix-ui/primitives/issues/1569
   */
  return (
    <ToolTipWrapper text={props.tooltip} key={id + props.value}>
      <div className="w-full p-1">
        <Label>{props.label}</Label>
        <Select
          value={props.value}
          disabled={props.disabled}
          onValueChange={(e) => {
            onPropChange({
              key: 'value',
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
            {props.options.map((option: selectOptions) => (
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
    colsCount: 5,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomSelectProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Select',
  events: [],
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      label: {
        type: 'string',
        default: defaultProps.label,
      },
      placeholder: {
        type: 'string',
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
      tooltip: { type: 'string' },
      disabled: { type: 'boolean', default: false },
      events: widgetsEventHandlerJsonSchema,
      value: {
        type: 'string',
      },
    },
    required: ['label', 'options'],
  },
  uiSchema: {
    value: { 'ui:widget': 'hidden' },
    label: {
      'ui:widget': 'inlineCodeInput',
      'ui:title': 'Label',
      'ui:placeholder': 'Enter label',
    },
    options: {
      'ui:widget': 'inlineCodeInput',
    },
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
      path: 'value',
      type: 'string',
    },
  },
};

export { WebloomSelect };
