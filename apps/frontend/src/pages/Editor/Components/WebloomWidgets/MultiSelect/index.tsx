import { Widget, WidgetConfig, selectOptions } from '@/lib/Editor/interface';
import { CopyCheck } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import MultipleSelect from './MultiSelect';
import { Label } from '@/components/ui/label';

export type WebloomSelectProps = {
  options: selectOptions[];
  label: string;
  value: selectOptions[];
};

const WebloomMultiSelect = observer(function WebloomMultiSelect() {
  const { id, onPropChange } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomSelectProps;
  return (
    <div className="absolute w-full">
      <Label>{props.label}</Label>
      <MultipleSelect
        options={props.options}
        value={props.value}
        onPropChange={onPropChange}
      />
    </div>
  );
});

const config: WidgetConfig = {
  name: 'MultiSelect',
  icon: <CopyCheck />,
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
  value: [],
};

const selectOptionsSchema = {
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
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      label: {
        type: 'string',
        default: defaultProps.label,
      },
      options: selectOptionsSchema,
      value: selectOptionsSchema,
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

export const WebloomMultiSelectWidget: Widget<WebloomSelectProps> = {
  component: WebloomMultiSelect,
  config,
  defaultProps,
  schema,
};

export { WebloomMultiSelect };
