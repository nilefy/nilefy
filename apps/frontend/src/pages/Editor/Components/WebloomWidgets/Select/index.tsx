import { Widget, WidgetConfig, selectOptions } from '@/lib/Editor/interface';
import { CheckSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import SelectComponent from '../../_Components/Select';
import { Label } from '@radix-ui/react-label';
export type WebloomSelectProps = {
  options: selectOptions[];
  lable: string;
};
const WebloomSelect = observer(() => {
  const { id } = useContext(WidgetContext);
  const { lable, ...rest } = editorStore.currentPage.getWidgetById(id)
    .values as WebloomSelectProps;
  return (
    <div>
      <Label>{lable}</Label>
      <SelectComponent {...rest}></SelectComponent>
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
  lable: 'Select',
};
const widgetName = 'WebloomSelect';

const inspectorConfig: WidgetInspectorConfig<WebloomSelectProps> = [
  {
    sectionName: 'General',
    children: [
      {
        id: `${widgetName}-text`,
        key: 'lable',
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
export const WebloomSelectWidget: Widget<WebloomSelectProps> = {
  component: WebloomSelect,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomSelect };
