import { WidgetConfig, WidgetInspectorConfig } from '@/lib/Editor/interface';
import { Button } from '../../_Components';
import { MousePointerSquare } from 'lucide-react';
import { ComponentProps } from 'react';

type WebloomButtonProps = ComponentProps<typeof Button>;

const WebloomButton = (props: WebloomButtonProps) => {
  return <Button {...props} />;
};
export const WebloomButtonConfig: WidgetConfig = {
  name: 'Button',
  icon: <MousePointerSquare />,
  isCanvas: false,
  layoutConfig: {
    colsCount: 2,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
};
const widgetName = 'WebloomButton';

export const WebloomButtonInspectorConfig: WidgetInspectorConfig<WebloomButtonProps> =
  [
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
            options: [
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
export { WebloomButton };
