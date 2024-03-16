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
import { ToolTipWrapper } from '../tooltipWrapper';
import clsx from 'clsx';
import { autorun } from 'mobx';

export type WebloomTextAreaProps = {
  label: {
    text: string;
    position: 'left' | 'top';
  };
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  value?: string;
  defaultValue?: string;
  events: WidgetsEventHandler;
  caption?: string;
  tooltip?: string;
  maxLength?: number;
  minLength?: number;
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
    [onPropChange],
  );

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
    <ToolTipWrapper text={props.tooltip}>
      <div
        className={clsx('flex h-full w-full gap-4 p-1', {
          'flex-col': props.label.position === 'top',
          'items-center': props.label.position === 'left',
        })}
      >
        <Label htmlFor={id}>{props.label.text}</Label>
        <Textarea
          id={id}
          className="h-full w-full resize-none"
          ref={textAreaRef}
          placeholder={props.placeholder}
          value={props.value ?? ''}
          disabled={props.disabled}
          autoFocus={props.autoFocus}
          maxLength={props.maxLength}
          minLength={props.minLength}
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
            editorStore.executeActions<typeof webloomTextAreaEvents>(
              id,
              'onBlur',
            )
          }
        />
        <p className="text-sm text-muted-foreground">{props.caption}</p>
      </div>
    </ToolTipWrapper>
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
  label: { text: 'Label', position: 'left' },
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
      defaultValue: {
        type: 'string',
      },
      caption: {
        type: 'string',
      },
      tooltip: {
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
      maxLength: {
        type: 'number',
      },
      minLength: {
        type: 'number',
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
    defaultValue: { 'ui:widget': 'inlineCodeInput' },
    caption: {
      'ui:widget': 'inlineCodeInput',
    },
    maxLength: {
      'ui:widget': 'inlineCodeInput',
    },
    minLength: {
      'ui:widget': 'inlineCodeInput',
    },
    label: {
      text: {
        'ui:widget': 'inlineCodeInput',
        'ui:title': 'Label',
        'ui:placeholder': 'Enter label',
      },
    },
    tooltip: {
      'ui:widget': 'inlineCodeInput',
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
