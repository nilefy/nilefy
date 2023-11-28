import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { Type } from 'lucide-react';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
export type WebloomTextProps = {
  text: string;
};
const WebloomText = (props: WebloomTextProps) => {
  return <span className="h-full w-full break-all">{props.text}</span>;
};
const config: WidgetConfig = {
  name: 'Text',
  icon: <Type />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 2,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
  resizingDirection: 'Both',
};

const defaultProps: WebloomTextProps = {
  text: 'Text',
};
const widgetName = 'WebloomText';

const inspectorConfig: WidgetInspectorConfig<WebloomTextProps> = [
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
export const WebloomTextWidget: Widget<WebloomTextProps> = {
  component: WebloomText,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomText };
