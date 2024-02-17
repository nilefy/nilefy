import { Widget, WidgetConfig, selectOptions } from '@/lib/Editor/interface';
import { CopyCheck } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { Label } from '@radix-ui/react-label';
import MultipleSelect from '../../_Components/MultiSelect';
export type WebloomSelectProps = {
  options: selectOptions[];
  label: string;
};
const WebloomMultiSelect = observer(() => {
  const { id } = useContext(WidgetContext);
  const { label, ...rest } = editorStore.currentPage.getWidgetById(id)
    .values as WebloomSelectProps;
  return (
    <div className="absolute">
      <Label>{label}</Label>
      <MultipleSelect {...rest}></MultipleSelect>
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
};
const widgetName = 'WebloomMultiSelect';

const inspectorConfig: WidgetInspectorConfig<WebloomSelectProps> = [
  {
    sectionName: 'General',
    children: [
      {
        id: `${widgetName}-text`,
        key: 'label',
        label: 'Name',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Enter A Name',
          label: 'Lable',
          value: 'slkslk',
        },
      },
      {
        id: `${widgetName}-options`,
        key: 'options',
        label: 'options',
        type: 'inlineCodeInput',
        options: {
          label: 'Options',
        },
      },
    ],
  },
];
export const WebloomMultiSelectWidget: Widget<WebloomSelectProps> = {
  component: WebloomMultiSelect,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomMultiSelect };
