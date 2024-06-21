import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { UploadCloud } from 'lucide-react';
import { useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WidgetContext } from '../..';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';

type NileyFile = {
  data: string;
  name: string;
  type: string;
};

export type NilefyFilePickerProps = {
  label: string;
  files?: File[];
  dataFormat: 'base64' | 'binary' | 'text' | 'arrayOfObjects';
};
const NilefyFilePicker = observer(() => {
  const { onPropChange, id } = useContext(WidgetContext);
  const props = editorStore.currentPage.getWidgetById(id)
    .finalValues as NilefyFilePickerProps;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Label>{props.label}</Label>
      <Input
        type="file"
        onChange={(e) => {
          const dataFormat = props.dataFormat;
          const files = Array.from(e.target.files || []);

          onPropChange({
            key: 'files',
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
  files: [],
  label: 'Label',
  dataFormat: 'base64',
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
      {
        path: 'dataFormat',
        label: 'Data Format',
        type: 'select',
        options: {
          items: [
            { value: 'base64', label: 'Base64' },
            { value: 'binary', label: 'Binary' },
            { value: 'text', label: 'Text' },
            { value: 'arrayOfObjects', label: 'Array of Objects' },
          ],
        },
      },
    ],
  },
];

const NilefyFilePickerWidget: Widget<NilefyFilePickerProps> = {
  component: NilefyFilePicker,
  publicAPI: {
    files: {
      type: 'static',
      typeSignature: `{
        data: string,
        name: string,
        type: string,
      }[]`,
      description: 'Files selected by the user',
    },
  },
  metaProps: new Set(['value']),
  config,
  initialProps,
  inspectorConfig,
};

export { NilefyFilePickerWidget };
