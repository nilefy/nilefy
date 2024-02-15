import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { TextCursorInput } from 'lucide-react';
import { ComponentPropsWithoutRef, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';

export type WebloomInputProps = Pick<
  ComponentPropsWithoutRef<typeof Input>,
  'placeholder' | 'value'
> & {
  label: string;
  type: 'text' | 'password';
  labelColor: string;
  textColor: string;
  borderRadius: string;
  fontSize: string;
  textAlignment: string;
  boxShadow: string;
};

const WebloomInput = observer(() => {
  const { onPropChange, id } = useContext(WidgetContext);
  const { label, ...rest } = editorStore.currentPage.getWidgetById(id)
    .values as WebloomInputProps;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label className={`${rest.fontSize} color-[${rest.labelColor}]`}>
        {label}
      </Label>
      <Input
        {...rest}
        className={`${rest.textAlignment} ${rest.boxShadow} ${rest.borderRadius}`}
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
  labelColor: 'black',
  textColor: 'white',
  borderRadius: 'rounded-none',
  fontSize: 'text-base',
  textAlignment: 'text-left',
  boxShadow: 'shadow-none',
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
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter placeholder',
          label: 'Placeholder',
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
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter label',
          label: 'Label',
        },
      },
    ],
  },
  {
    sectionName: 'Style',
    children: [
      {
        id: `${widgetName}-color`,
        key: 'labelColor',
        label: 'Font Color',
        type: 'color',
        options: {
          color: '#fff',
        },
      },
      {
        id: `${widgetName}-borderRadius`,
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'select',
        options: {
          items: [
            {
              label: 'None',
              value: 'rounded-none',
            },
            {
              label: 'Small',
              value: 'rounded-sm',
            },
            {
              label: 'Medium',
              value: 'rounded-md',
            },
            {
              label: 'Large',
              value: 'rounded-lg',
            },
            {
              label: 'Full',
              value: 'rounded-full',
            },
          ],
        },
      },
      {
        id: `${widgetName}-fontSize`,
        key: 'fontSize',
        label: 'Font Size',
        type: 'select',
        options: {
          items: [
            {
              label: 'Small',
              value: 'text-sm',
            },
            {
              label: 'Medium',
              value: 'text-base',
            },
            {
              label: 'Large',
              value: 'text-lg',
            },
          ],
        },
      },
      {
        id: `${widgetName}-textAlignment`,
        key: 'textAlignment',
        label: 'Text Alignment',
        type: 'select',
        options: {
          items: [
            {
              label: 'Left',
              value: 'text-left',
            },
            {
              label: 'Center',
              value: 'text-center',
            },
            {
              label: 'Right',
              value: 'text-right',
            },
          ],
        },
      },
      {
        id: `${widgetName}-boxShadow`,
        key: 'boxShadow',
        label: 'Box Shadow',
        type: 'select',
        options: {
          items: [
            {
              label: 'None',
              value: 'shadow-none',
            },
            {
              label: 'Small',
              value: 'shadow-sm',
            },
            {
              label: 'Medium',
              value: 'shadow-md',
            },
            {
              label: 'Large',
              value: 'shadow-lg',
            },
          ],
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
