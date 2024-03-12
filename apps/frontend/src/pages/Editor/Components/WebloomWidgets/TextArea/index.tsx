import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
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

export type WebloomTextAreaProps = {
  label: string;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  value?: string;
  events: WidgetsEventHandler;
};

const webloomTextAreaEvents = {
  onTextChanged: 'onTextChanged',
  onFocus: 'onFocus',
  onBlur: 'onBlur',
} as const;

const WebloomTextArea = observer(function WebloomTextArea() {
  const { onPropChange, id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as WebloomTextAreaProps;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const clearValue = useCallback(() => {
    onPropChange({
      key: 'value',
      value: '',
    });
  }, [onPropChange]);

  // append runtime methods
  useEffect(() => {
    widget.appendSetters([
      {
        key: 'focus',
        setter: () => {
          if (!textAreaRef || !textAreaRef.current) return;
          textAreaRef.current.focus();
        },
      },
      {
        key: 'clearValue',
        setter: clearValue,
      },
    ]);
  }, [clearValue]);

  return (
    <div className="flex h-full w-full items-center justify-center gap-2">
      <Label>{props.label}</Label>
      <Textarea
        className="h-full w-full resize-none"
        ref={textAreaRef}
        placeholder={props.placeholder}
        value={props.value ?? ''}
        disabled={props.disabled}
        autoFocus={props.autoFocus}
        onChange={(e) => {
          onPropChange({
            key: 'value',
            value: e.target.value,
          });
          editorStore.executeActions<typeof webloomTextAreaEvents>(
            id,
            'onTextChanged',
          );
        }}
        onFocus={() =>
          editorStore.executeActions<typeof webloomTextAreaEvents>(
            id,
            'onFocus',
          )
        }
        onBlur={() =>
          editorStore.executeActions<typeof webloomTextAreaEvents>(id, 'onBlur')
        }
      />
    </div>
  );
});

const config: WidgetConfig = {
  name: 'textarea',
  icon: <TextCursorInput />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 10,
    rowsCount: 10,
    minColumns: 2,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomTextAreaProps = {
  placeholder: 'Enter text',
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
        type: 'string',
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
    events: genEventHandlerUiSchema(webloomTextAreaEvents),
  },
};

const WebloomTextAreaWidget: Widget<WebloomTextAreaProps> = {
  component: WebloomTextArea,
  config,
  defaultProps,
  schema,
  setters: {
    setValue: {
      path: 'value',
      type: 'string',
    },
    setDisabled: {
      path: 'disabled',
      type: 'boolean',
    },
  },
};

export { WebloomTextAreaWidget };
