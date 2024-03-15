import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
  selectOptions,
} from '@/lib/Editor/interface';
import { CheckSquare } from 'lucide-react';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import SelectComponent from './Select';
import { Label } from '@/components/ui/label';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';
import { toJS } from 'mobx';

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
        options={toJS(props.options)}
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

const inspectorConfig: EntityInspectorConfig<WebloomSelectProps> = [
  {
    sectionName: 'General',
    children: [
      {
        label: 'Label',
        path: 'label',
        type: 'inlineCodeInput',
        options: {
          label: 'Label',
        },
      },
      {
        label: 'Options',
        path: 'options',
        type: 'inlineCodeInput',
        options: {
          label: 'Options',
        },
        validation: zodToJsonSchema(
          z
            .array(
              z.object({
                label: z.string(),
                value: z.string(),
              }),
            )
            .default([]),
        ),
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
