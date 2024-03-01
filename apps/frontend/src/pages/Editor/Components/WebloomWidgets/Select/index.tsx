import { Widget, WidgetConfig, selectOptions } from '@/lib/Editor/interface';
import { CheckSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import SelectComponent from './Select';
import { Label } from '@/components/ui/label';

export type WebloomSelectProps = {
  options: selectOptions[];
  label: string;
  value: string;
};

const WebloomSelect = observer(() => {
  const { id, onPropChange } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomSelectProps;
  return (
    <div className="w-full">
      <Label>{props.label}</Label>
      <SelectComponent
        value={props.value}
        options={props.options}
        onPropChange={onPropChange}
      />
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Select',
  icon: <CheckSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomSelectProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Select',
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

export const WebloomSelectWidget: Widget<WebloomSelectProps> = {
  component: WebloomSelect,
  config,
  defaultProps,
  schema,
};

export { WebloomSelect };
