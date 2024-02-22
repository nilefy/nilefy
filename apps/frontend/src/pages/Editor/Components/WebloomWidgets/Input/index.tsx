import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { useContext, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import z from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

/**
 * fields that you want to be on the configForm
 */
const webloomInputProps = z.object({
  placeholder: z.string().optional(),
  label: z.string(),
  type: z.union([
    z.literal('text'),
    z.literal('password'),
    z.literal('number'),
  ]),
  value: z.union([z.string(), z.number()]).optional(),
});

export type WebloomInputProps = z.infer<typeof webloomInputProps>;

const WebloomInput = observer(function WebloomInput() {
  const { onPropChange, id } = useContext(WidgetContext);
  const { label, type, ...rest } = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomInputProps;
  // useEffect(() => {
  //   if (type === 'password' || type === 'text')
  //     onPropChange({ value: '', key: 'value' });
  //   if (type === 'number') onPropChange({ value: 0, key: 'value' });
  // }, [type, onPropChange]);
  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label>{label}</Label>
      <Input
        type={type}
        {...rest}
        onChange={(e) => {
          onPropChange({
            key: 'value',
            value: e.target.value,
          });
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
};

const defaultProps: WebloomInputProps = {
  placeholder: 'Enter text',
  value: '',
  label: 'Label',
  type: 'text',
};

const schema: WidgetInspectorConfig = {
  dataSchema: zodToJsonSchema(webloomInputProps),
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
  },
};

export { WebloomInputWidget };
