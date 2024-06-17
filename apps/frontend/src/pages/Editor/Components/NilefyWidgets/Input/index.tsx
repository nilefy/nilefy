import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { useContext, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { StringSchema } from '@/lib/Editor/validations';
import { autorun } from 'mobx';
import { useAutoRun, useExposeWidgetApi } from '@/lib/Editor/hooks';
import z from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export type NilefyInputProps = {
  label: string;
  type: 'number' | 'text' | 'password';
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  value?: string | number;
  onTextChange?: string;
  onFocus?: string;
  onBlur?: string;
  onSubmit?: string;
  defaultValue?: string | number;
};
const NilefyInput = observer(() => {
  const { onPropChange, id } = useContext(WidgetContext);
  const ref = useRef<HTMLInputElement>(null);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as NilefyInputProps;
  useEffect(
    () =>
      autorun(() => {
        if (props.type === 'password' || props.type === 'text')
          onPropChange({ value: '', key: 'value' });
        if (props.type === 'number') onPropChange({ value: 0, key: 'value' });
      }),
    [onPropChange, props.type],
  );
  // set default value
  useAutoRun(() =>
    onPropChange({
      key: 'value',
      value: props.defaultValue,
    }),
  );
  useExposeWidgetApi(id, {
    focus: () => {
      if (!ref.current) return;
      ref.current.focus();
    },
    blur: () => {
      if (!ref.current) return;
      ref.current.blur();
    },
  });
  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label>{props.label}</Label>
      <Input
        ref={ref}
        placeholder={props.placeholder}
        type={props.type}
        value={props.value ?? ''}
        disabled={props.disabled}
        autoFocus={props.autoFocus}
        onChange={(e) => {
          onPropChange({
            key: 'value',
            value: e.target.value,
          });
          widget.handleEvent('onTextChange');
        }}
        onFocus={() => {
          widget.handleEvent('onFocus');
        }}
        onBlur={() => {
          widget.handleEvent('onBlur');
        }}
      />
    </div>
  );
});
const config: WidgetConfig = {
  name: 'Input',
  icon: TextCursorInput,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 8,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Horizontal',
  widgetActions: {
    focus: {
      fn(entity) {
        entity.api.focus();
      },
      name: 'focus',
      type: 'SIDE_EFFECT',
    },
    blur: {
      fn(entity) {
        entity.api.blur();
      },
      name: 'blur',
      type: 'SIDE_EFFECT',
    },
    clearValue: {
      type: 'SETTER',
      path: 'value',
      value: '',
      name: 'clearValue',
    },
    setValue: {
      type: 'SETTER',
      path: 'value',
      name: 'setValue',
    },
  },
};

const initialProps: NilefyInputProps = {
  placeholder: 'Enter text',
  value: '',
  label: 'Label',
  type: 'text',
  disabled: false,
};

const inspectorConfig: EntityInspectorConfig<NilefyInputProps> = [
  {
    sectionName: 'Basic',
    children: [
      {
        path: 'type',
        label: 'Type',
        type: 'select',
        options: {
          items: [
            {
              label: 'Text',
              value: 'text',
            },
            {
              label: 'Number',
              value: 'number',
            },
            {
              label: 'Password',
              value: 'password',
            },
          ],
          placeholder: 'Select type',
        },
      },
      {
        path: 'placeholder',
        label: 'Placeholder',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter placeholder',
        },
        validation: StringSchema('Write something'),
      },
      {
        path: 'defaultValue',
        label: 'Default Value',
        type: 'inlineCodeInput',
        options: { placeholder: 'Enter default value' },
        validation: zodToJsonSchema(z.string().default('')),
      },
    ],
  },
  {
    sectionName: 'Label',
    children: [
      {
        path: 'label',
        label: 'Label',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter label',
        },
        validation: StringSchema('Label'),
      },
    ],
  },
  {
    sectionName: 'Interactions',
    children: [
      {
        path: 'onTextChange',
        label: 'onTextChange',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'onTextChange',
        },
      },
      {
        path: 'onFocus',
        label: 'onFocus',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'onFocus',
        },
      },
      {
        path: 'onBlur',
        label: 'onBlur',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'onBlur',
        },
      },
      {
        path: 'onSubmit',
        label: 'onSubmit',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'onSubmit',
        },
      },
    ],
  },
];
const NilefyInputWidget: Widget<NilefyInputProps> = {
  component: NilefyInput,
  config,
  initialProps,
  publicAPI: {
    value: {
      description: 'Input widget',
      type: 'static',
      typeSignature: 'string',
    },
    focus: {
      description: 'Focus on input',
      type: 'function',
    },
    blur: {
      description: 'Blur input',
      type: 'function',
    },
    clearValue: {
      description: 'Clear input value',
      type: 'function',
    },
    setValue: {
      description: 'Set input value',
      type: 'function',
      args: [
        {
          name: 'value',
          type: 'string',
        },
      ],
    },
  },
  metaProps: new Set(['value']),
  inspectorConfig,
};

export { NilefyInputWidget };
