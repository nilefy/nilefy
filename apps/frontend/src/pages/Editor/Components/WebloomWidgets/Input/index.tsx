import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { ComponentPropsWithoutRef, useContext, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
import { WidgetContext } from '../..';

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
  const { label, ...rest } = props;
  const { onPropChange } = useContext(WidgetContext);
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
};
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