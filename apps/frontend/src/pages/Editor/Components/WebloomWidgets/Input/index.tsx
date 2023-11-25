import {
  Widget,
  WidgetConfig,
  WidgetInspectorConfig,
} from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { ComponentPropsWithoutRef, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type WebloomInputProps = Pick<
  ComponentPropsWithoutRef<typeof Input>,
  'placeholder' | 'value'
> & {
  label: string;
  type: 'text' | 'password';
};
export type WebloomInputInterface = {
  setValue: (value: string) => void;
  setDisabled: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  clearValue: () => void;
  focus: () => void;
};
const WebloomInput = (props: WebloomInputProps) => {
  const { label, value } = props;
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center justify-center gap-2">
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
};
const config: WidgetConfig = {
  name: 'Input',
  icon: <TextCursorInput />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 2,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Horizontal',
};

const defaultProps: WebloomInputProps = {
  placeholder: 'Enter text',

  label: 'Label',
  type: 'text',
};

const widgetName = 'WebloomInput';

const inspectorConfig: WidgetInspectorConfig<WebloomInputProps> = [
  {
    sectionName: 'Basic',
    children: [
      {
        id: `${widgetName}-Type`,
        key: 'type',
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
        id: `${widgetName}-placeholder`,
        key: 'placeholder',
        label: 'Placeholder',
        type: 'input',
        options: {
          placeholder: 'Enter placeholder',
          type: 'text',
        },
      },
    ],
  },
  {
    sectionName: 'Label',
    children: [
      {
        id: `${widgetName}-label`,
        key: 'label',
        label: 'Label',
        type: 'input',
        options: {
          placeholder: 'Enter label',
          type: 'text',
        },
      },
    ],
  },
];
const WebloomInputWidget: Widget<WebloomInputProps> = {
  component: WebloomInput,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomInputWidget };
