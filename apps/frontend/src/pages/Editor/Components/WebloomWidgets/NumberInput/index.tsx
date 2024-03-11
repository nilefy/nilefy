import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import {
  WidgetsEventHandler,
  genEventHandlerUiSchema,
  widgetsEventHandlerJsonSchema,
} from '@/components/rjsf_shad/eventHandler';

export type WebloomInputProps = {
  label: string;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  value?: number;
  events: WidgetsEventHandler;
};

const webloomNumberInputEvents = {
  onChange: 'onChange',
  onFocus: 'onFocus',
  onBlur: 'onBlur',
} as const;

const WebloomNumberInput = observer(function WebloomNumberInput() {
  const { onPropChange, id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as WebloomInputProps;
  const inputRef = useRef<HTMLInputElement>(null);

  const clearValue = useCallback(() => {
    onPropChange({
      key: 'value',
      value: 0,
    });
  }, [onPropChange]);

  useEffect(() => {
    widget.appendSetters([
      {
        key: 'focus',
        setter: () => {
          if (!inputRef || !inputRef.current) return;
          inputRef.current.focus();
        },
      },
      {
        key: 'clearValue',
        setter: clearValue,
      },
    ]);
  }, [clearValue]);

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label>{props.label}</Label>
      <Input
        ref={inputRef}
        placeholder={props.placeholder}
        type="number"
        value={props.value ?? 0}
        disabled={props.disabled}
        autoFocus={props.autoFocus}
        onChange={(e) => {
          onPropChange({
            key: 'value',
            value: e.target.value,
          });
          editorStore.executeActions<typeof webloomNumberInputEvents>(
            id,
            'onChange',
          );
        }}
        onFocus={() =>
          editorStore.executeActions<typeof webloomNumberInputEvents>(
            id,
            'onFocus',
          )
        }
        onBlur={() =>
          editorStore.executeActions<typeof webloomNumberInputEvents>(
            id,
            'onBlur',
          )
        }
      />
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Number Input',
  icon: <TextCursorInput />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 8,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Horizontal',
};

const defaultProps: WebloomInputProps = {
  placeholder: 'Enter text',
  value: 0,
  label: 'Label',
  disabled: false,
  events: [],
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      placeholder: {
        type: 'string',
      },
      label: {
        type: 'string',
      },
      disabled: {
        type: 'boolean',
        default: false,
      },
      autoFocus: {
        type: 'boolean',
        default: false,
      },
      events: widgetsEventHandlerJsonSchema,
      value: {
        type: 'number',
      },
    },
    required: ['events', 'label'],
  },
  uiSchema: {
    value: { 'ui:widget': 'hidden' },
    placeholder: {
      'ui:widget': 'inlineCodeInput',
      'ui:title': 'Placeholder',
      'ui:placeholder': 'Enter placeholder',
    },
    label: {
      'ui:widget': 'inlineCodeInput',
      'ui:title': 'Label',
      'ui:placeholder': 'Enter label',
    },
    events: genEventHandlerUiSchema(webloomNumberInputEvents),
  },
};

const WebloomNumberInputWidget: Widget<WebloomInputProps> = {
  component: WebloomNumberInput,
  config,
  defaultProps,
  schema,
  setters: {
    setValue: {
      path: 'value',
      type: 'number',
    },
    setDisabled: {
      path: 'disabled',
      type: 'boolean',
    },
  },
};

export { WebloomNumberInputWidget };
