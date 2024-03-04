import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { useContext, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
// import z from 'zod';
// import zodToJsonSchema from 'zod-to-json-schema';
import { autorun } from 'mobx';
import {
  WidgetsEventHandler,
  genEventHandlerUiSchema,
  widgetsEventHandlerJsonSchema,
} from '@/components/rjsf_shad/eventHandler';

/**
 * fields that you want to be on the configForm
 */
// const webloomInputProps = z.object({
//   placeholder: z.string().optional(),
//   label: z.string(),
//   type: z.union([
//     z.literal('text'),
//     z.literal('password'),
//     z.literal('number'),
//     z.literal('email'),
//   ]),
//   disabled: z.boolean().default(false).optional(),
//   autoFocus: z.boolean().default(false).optional(),
//   value: z.union([z.string(), z.number()]).optional(),
//   events: widgetsEventHandler,
// });

export type WebloomInputProps = {
  label: string;
  type: 'number' | 'text' | 'password';
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  value?: string | number | undefined;
  events: WidgetsEventHandler;
};

const webloomInputEvents = {
  onTextChanged: 'onTextChanged',
  onFocus: 'onFocus',
  onBlur: 'onBlur',
} as const;

const WebloomInput = observer(function WebloomInput() {
  const { onPropChange, id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomInputProps;
  useEffect(
    () =>
      autorun(() => {
        if (props.type === 'password' || props.type === 'text')
          onPropChange({ value: '', key: 'value' });
        if (props.type === 'number') onPropChange({ value: 0, key: 'value' });
      }),
    [onPropChange],
  );

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label>{props.label}</Label>
      <Input
        placeholder={props.placeholder}
        type={props.type}
        value={props.value}
        disabled={props.disabled}
        autoFocus={props.autoFocus}
        onChange={(e) => {
          onPropChange({
            key: 'value',
            value: e.target.value,
          });
          editorStore.executeActions<typeof webloomInputEvents>(
            id,
            'onTextChanged',
          );
        }}
        onFocus={() =>
          editorStore.executeActions<typeof webloomInputEvents>(id, 'onFocus')
        }
        onBlur={() =>
          editorStore.executeActions<typeof webloomInputEvents>(id, 'onBlur')
        }
      />
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Input',
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
  value: '',
  label: 'Label',
  type: 'text',
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
      type: {
        type: 'string',
        enum: ['text', 'password', 'number', 'email'],
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
        anyOf: [{ type: 'string' }, { type: 'number' }],
      },
    },
    required: ['events', 'label'],
  },
  uiSchema: {
    value: { 'ui:widget': 'hidden' },
    type: {
      'ui:placeholder': 'Select type',
      'ui:title': 'Type',
    },
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
    events: genEventHandlerUiSchema(webloomInputEvents),
  },
};

const WebloomInputWidget: Widget<WebloomInputProps> = {
  component: WebloomInput,
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

export { WebloomInputWidget };
