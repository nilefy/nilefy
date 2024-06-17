import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { useContext, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { useExposeWidgetApi } from '@/lib/Editor/hooks';
import { StringSchema } from '@/lib/Editor/validations';

export type NilefyInputProps = {
  label: string;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  value?: number;
  onChange?: string;
  onFocus?: string;
  onBlur?: string;
  onSubmit?: string;
};

const NilefyNumberInput = observer(function NilefyNumberInput() {
  const { onPropChange, id } = useContext(WidgetContext);
  const widget = editorStore.currentPage.getWidgetById(id);
  const props = widget.finalValues as NilefyInputProps;
  const inputRef = useRef<HTMLInputElement>(null);

  useExposeWidgetApi(id, {
    focus: () => {
      if (!inputRef.current) return;
      inputRef.current.focus();
    },
    blur: () => {
      if (!inputRef.current) return;
      inputRef.current.blur();
    },
  });

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
          widget.handleEvent('onChange');
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
  name: 'Number Input',
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
  value: 0,
  label: 'Label',
  disabled: false,
};

const inspectorConfig: EntityInspectorConfig<NilefyInputProps> = [
  {
    sectionName: 'Basic',
    children: [
      {
        path: 'placeholder',
        label: 'Placeholder',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter placeholder',
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
        },
        validation: StringSchema('Label'),
      },
    ],
  },
  {
    sectionName: 'Events',
    children: [
      {
        path: 'onChange',
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

const NilefyNumberInputWidget: Widget<NilefyInputProps> = {
  component: NilefyNumberInput,
  metaProps: new Set(['value']),
  publicAPI: {
    value: {
      description: 'Input widget',
      type: 'static',
      typeSignature: 'number',
    },
    focus: {
      type: 'function',
    },
    blur: {
      type: 'function',
    },
    clearValue: {
      type: 'function',
    },
    setValue: {
      type: 'function',
      args: [
        {
          name: 'value',
          type: 'number',
        },
      ],
    },
  },
  config,
  initialProps,
  inspectorConfig,
};

export { NilefyNumberInputWidget };
