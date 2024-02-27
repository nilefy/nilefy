import { Widget, WidgetConfig, selectOptions } from '@/lib/Editor/interface';
import { CircleDot } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import { RadioGroupComponent } from './radioGroup';

export type WebloomRadioProps = {
  options: selectOptions[];
  label: string;
  value: string;
};

const WebloomRadio = observer(() => {
  const { id, onPropChange } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomRadioProps;
  return (
    <div className="w-full">
      <Label>{props.label}</Label>
      <RadioGroupComponent
        value={props.value}
        options={props.options}
        onPropChange={onPropChange}
      />
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Radio',
  icon: <CircleDot />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomRadioProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Radio',
  value: 'Option 1',
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      label: {
        type: 'string',
        default: defaultProps.label,
      },
      options: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            value: {
              type: 'string',
            },
            label: {
              type: 'string',
            },
          },
        },
      },
      value: {
        type: 'string',
      },
    },
    required: ['label', 'options'],
  },
  uiSchema: {
    value: { 'ui:widget': 'hidden' },
    label: {
      'ui:widget': 'inlineCodeInput',
      'ui:title': 'Label',
      'ui:placeholder': 'Enter label',
    },
    options: {
      'ui:widget': 'inlineCodeInput',
    },
  },
};

export const WebloomRadioWidget: Widget<WebloomRadioProps> = {
  component: WebloomRadio,
  config,
  defaultProps,
  schema,
};

export { WebloomRadio };
