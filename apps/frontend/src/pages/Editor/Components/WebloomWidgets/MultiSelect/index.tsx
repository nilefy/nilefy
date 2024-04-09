import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
  selectOptions,
} from '@/lib/Editor/interface';
import { CopyCheck } from 'lucide-react';
import { useContext } from 'react';
import { WidgetContext } from '../..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import MultipleSelect from './MultiSelect';
import { Label } from '@/components/ui/label';
import zodToJsonSchema from 'zod-to-json-schema';
import { z } from 'zod';

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
    <div className=" w-full">
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

const initialProps: WebloomSelectProps = {
  options: [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
    { value: 'Option 3', label: 'Option 3' },
  ],
  label: 'Select',
  value: [],
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
          placeholder: 'Label',
        },
      },
      {
        label: 'Options',
        path: 'options',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Options',
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
export const WebloomMultiSelectWidget: Widget<WebloomSelectProps> = {
  component: WebloomMultiSelect,
  metaProps: new Set(['value']),
  config,
  initialProps,
  inspectorConfig,
};

export { WebloomMultiSelect };
