import {
  Widget,
  WidgetConfig,
  WidgetInspectorConfig,
} from '@/lib/Editor/interface';
import { Container } from '../../_Components/Container';
import { BoxSelect } from 'lucide-react';
import { ComponentProps, ComponentPropsWithoutRef } from 'react';

type WebloomContainerProps = ComponentPropsWithoutRef<typeof Container>;
const WebloomContainer = (props: WebloomContainerProps) => {
  return <Container {...props} />;
};
const widgetName = 'WebloomContainer';
export const defaultProps: WebloomContainerProps = {
  color: 'blue',
};
export const inspectorConfig: WidgetInspectorConfig<WebloomContainerProps> = [
  {
    sectionName: 'General',
    children: [
      {
        id: `${widgetName}-color`,
        key: 'color',
        label: 'Color',
        type: 'select',
        options: {
          placeholder: 'Select color',
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
export const config: WidgetConfig = {
  name: 'Container',
  icon: <BoxSelect />,
  isCanvas: true,
  layoutConfig: {
    colsCount: 2,
    rowsCount: 4,
    minColumns: 1,
    minRows: 4,
  },
};
export const WebloomContainerWidget: Widget<WebloomContainerProps> = {
  component: WebloomContainer,
  defaultProps,
  inspectorConfig,
  config,
};
export { WebloomContainer };
