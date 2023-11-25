import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { MousePointerSquare } from 'lucide-react';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
import { Button } from '@/components/ui/button';
export type WebloomButtonProps = {
  text: string;
  color: 'red' | 'blue' | 'transparent';
};
const WebloomButton = (props: WebloomButtonProps) => {
  return (
    <Button {...props} className=" active:bg-primary/20 h-full w-full">
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
  color: 'red',
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
      {
        id: `${widgetName}-color`,
        key: 'color',
        label: 'Color',
        type: 'select',
        options: {
          items: [
            {
              label: 'Red',
              value: 'red',
            },
            {
              label: 'Blue',
              value: 'blue',
            },
            {
              label: 'Transparent',
              value: 'transparent',
            },
          ],
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
