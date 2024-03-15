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
import { useExposeWidgetApi } from '@/lib/Editor/hooks';

export type WebloomInputProps = {
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
};
const WebloomInput = observer(() => {
  const { onPropChange, id } = useContext(WidgetContext);
  const ref = useRef<HTMLInputElement>(null);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as WebloomInputProps;
  useEffect(
    () =>
      autorun(() => {
        if (props.type === 'password' || props.type === 'text')
          onPropChange({ value: '', key: 'value' });
        if (props.type === 'number') onPropChange({ value: 0, key: 'value' });
      }),
    [onPropChange, props.type],
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
        value={props.value}
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
  icon: <TextCursorInput />,
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
  },
};

const defaultProps: WebloomInputProps = {
  placeholder: 'Enter text',
  value: '',
  label: 'Label',
  type: 'text',
  disabled: false,
};

const inspectorConfig: EntityInspectorConfig<WebloomInputProps> = [
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
          label: 'Placeholder',
        },
        validation: StringSchema('Write something'),
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
          label: 'Label',
        },
        validation: StringSchema('Label'),
      },
    ],
  },
  {
    sectionName: 'Events',
    children: [
      {
        path: 'onTextChange',
        label: 'onTextChange',
        type: 'inlineCodeInput',
        options: {
          label: 'onTextChange',
        },
      },
      {
        path: 'onFocus',
        label: 'onFocus',
        type: 'inlineCodeInput',
        options: {
          label: 'onFocus',
        },
      },
      {
        path: 'onBlur',
        label: 'onBlur',
        type: 'inlineCodeInput',
        options: {
          label: 'onBlur',
        },
      },
      {
        path: 'onSubmit',
        label: 'onSubmit',
        type: 'inlineCodeInput',
        options: {
          label: 'onSubmit',
        },
      },
    ],
  },
];
const WebloomInputWidget: Widget<WebloomInputProps> = {
  component: WebloomInput,
  config,
  defaultProps,
  publicAPI: new Set(['value']),
  inspectorConfig,
};

export { WebloomInputWidget };
