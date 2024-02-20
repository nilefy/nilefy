import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { StringSchema } from '@/lib/Editor/validations';

export type WebloomInputProps = {
  label: string;
  type: 'text' | 'password';
  placeholder: string;
  value: string;
};

const WebloomInput = observer(() => {
  const { onPropChange, id } = useContext(WidgetContext);
  const { label, ...rest } = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomInputProps;
  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label>{label}</Label>
      <Input
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
];
const WebloomInputWidget: Widget<WebloomInputProps> = {
  component: WebloomInput,
  config,
  defaultProps,
  publicAPI: new Set(['value']),
  inspectorConfig,
};

export { WebloomInputWidget };
