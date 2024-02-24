import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { UploadCloud } from 'lucide-react';
import { ComponentPropsWithoutRef, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';

export type WebloomFilePickerProps = Pick<
  ComponentPropsWithoutRef<typeof Input>,
  'value'
> & {
  label: string;
};

const WebloomFilePicker = observer(() => {
  const { onPropChange, id } = useContext(WidgetContext);
  const { label, ...rest } = editorStore.currentPage.getWidgetById(id)
    .values as WebloomFilePickerProps;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label>{label}</Label>
      <Input
        {...rest}
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
  icon: <UploadCloud />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 5,
    rowsCount: 8,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Horizontal',
};

const defaultProps: WebloomFilePickerProps = {
  value: '',
  label: 'Label',
  type: 'file',
};

const widgetName = 'WebloomInput';

const inspectorConfig: WidgetInspectorConfig<WebloomFilePickerProps> = [
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
];
const WebloomFilePickerWidget: Widget<WebloomFilePickerProps> = {
  component: WebloomFilePicker,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomFilePickerWidget };
