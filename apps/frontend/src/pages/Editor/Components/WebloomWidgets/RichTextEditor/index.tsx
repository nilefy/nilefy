import { Editor } from '@tinymce/tinymce-react';
import { MousePointerSquare } from 'lucide-react';
import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
type WebloomTextEditorProps = {
  text: string;
};
export default function WebloomTextEditor() {
  // note that skin and content_css is disabled to avoid the normal
  // loading process and is instead loaded as a string via content_style
  return (
    <Editor
      init={{
        resize: false,
        height: '100%',
      }}
    />
  );
}

const config: WidgetConfig = {
  name: 'Text Editor',
  icon: <MousePointerSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 2,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomTextEditorProps = {
  text: 'Text Editor',
};
const widgetName = 'WebloomTextEditor';

const inspectorConfig: WidgetInspectorConfig<WebloomTextEditorProps> = [
  {
    sectionName: 'General',
    children: [
      {
        id: `${widgetName}-text`,
        key: 'text',
        label: 'Text',
        type: 'input',
        options: {
          placeholder: 'Enter text',
          type: 'text',
        },
      },
    ],
  },
];
export const WebloomTextEditorWidget: Widget<WebloomTextEditorProps> = {
  component: WebloomTextEditor,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomTextEditor };
