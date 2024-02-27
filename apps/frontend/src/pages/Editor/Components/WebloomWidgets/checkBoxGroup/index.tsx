import { Widget, WidgetConfig, selectOptions } from '@/lib/Editor/interface';
import { ListChecks } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@/components/ui/label';
import { CheckBoxGroup } from './checkBoxGroup';

export type WebloomCheckBoxGroupProps = {
  options: selectOptions[];
  label: string;
  value: selectOptions[];
};

const WebloomCheckBoxGroup = observer(() => {
  const { id, onPropChange } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomCheckBoxGroupProps;
  return (
    <div className="w-full">
      <Label>{props.label}</Label>
      <CheckBoxGroup
        value={props.value}
        options={props.options}
        onPropChange={onPropChange}
      />
    </div>
  );
});

const config: WidgetConfig = {
  name: 'Check Box Group',
  icon: <ListChecks />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 14,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomCheckBoxGroupProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Check Box Group',
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
export const WebloomCheckBoxGroupWidget: Widget<WebloomCheckBoxGroupProps> = {
  component: WebloomCheckBoxGroup,
  config,
  defaultProps,
  schema,
};

export { WebloomCheckBoxGroup };
