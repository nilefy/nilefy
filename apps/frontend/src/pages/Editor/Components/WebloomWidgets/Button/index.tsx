import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { Button } from '@/components/ui/button';
export type WebloomButtonProps = {
  text: string;
  color: string;
  event: string;
};
const WebloomButton = (props: WebloomButtonProps) => {
  return (
    <Button
      {...props}
      className={`block h-full w-full active:bg-primary/20`}
      style={{ backgroundColor: props.color }}
    >
      {props.text}
    </Button>
  );
};
const config: WidgetConfig = {
  name: 'Button',
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

const defaultProps: WebloomButtonProps = {
  text: 'Button',
  color: 'black',
  event: 'onclick',
};
const widgetName = 'WebloomButton';

const inspectorConfig: WidgetInspectorConfig<WebloomButtonProps> = [
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
  {
    sectionName: 'Interactions',
    children: [
      {
        id: `${widgetName}-text`,
        key: 'event',
        label: 'Event',
        type: 'event',
        options: {},
      },
    ],
  },
  {
    sectionName: 'Color',
    children: [
      {
        id: `${widgetName}-color`,
        key: 'color',
        label: 'Color',
        type: 'color',
        options: {
          color: '#fff',
        },
      },
    ],
  },
];
export const WebloomButtonWidget: Widget<WebloomButtonProps> = {
  component: WebloomButton,
  config,
  defaultProps,
  inspectorConfig,
};

export { WebloomButton };
