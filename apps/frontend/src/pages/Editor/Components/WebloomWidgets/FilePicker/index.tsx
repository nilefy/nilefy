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
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as WebloomFilePickerProps;

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
  value: undefined,
  label: 'Label',
};

const schema: WidgetInspectorConfig = {
  dataSchema: {
    type: 'object',
    properties: {
      label: {
        type: 'string',
        default: '',
      },
      value: {
        type: 'string',
      },
    },
    required: ['label'],
  },
  uiSchema: {
    label: {
      'ui:label': 'Label',
      'ui:widget': 'inlineCodeInput',
    },
    value: { 'ui:widget': 'hidden' },
  },
};

const WebloomFilePickerWidget: Widget<WebloomFilePickerProps> = {
  component: WebloomFilePicker,
  config,
  defaultProps,
  schema,
};

export { WebloomFilePickerWidget };
