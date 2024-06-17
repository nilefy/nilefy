import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { UploadCloud } from 'lucide-react';
import { ComponentPropsWithoutRef, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';

export type NilefyFilePickerProps = Pick<
  ComponentPropsWithoutRef<typeof Input>,
  'value'
> & {
  label: string;
};

const NilefyFilePicker = observer(() => {
  const { onPropChange, id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as NilefyFilePickerProps;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label>{props.label}</Label>
      <Input
        value={props.value}
        type="file"
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
  name: 'File Picker',
  icon: UploadCloud,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 8,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Horizontal',
};

const initialProps: NilefyFilePickerProps = {
  value: undefined,
  label: 'Label',
};

const inspectorConfig: EntityInspectorConfig<NilefyFilePickerProps> = [
  {
    sectionName: 'General',
    children: [
      {
        label: 'Label',
        type: 'inlineCodeInput',
        options: {
          placeholder: 'Label',
        },
        path: 'label',
      },
    ],
  },
];

const NilefyFilePickerWidget: Widget<NilefyFilePickerProps> = {
  component: NilefyFilePicker,
  metaProps: new Set(['value']),
  config,
  initialProps,
  inspectorConfig,
};

export { NilefyFilePickerWidget };
