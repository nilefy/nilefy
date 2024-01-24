import { Widget, WidgetConfig } from '@/lib/Editor/interface';
import { Container } from '../../_Components/Container';
import { BoxSelect } from 'lucide-react';
import { ComponentPropsWithoutRef, useContext } from 'react';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { WidgetContext } from '../..';

type WebloomContainerProps = ComponentPropsWithoutRef<typeof Container>;
const WebloomContainer = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { id } = useContext(WidgetContext);
    const props = editorStore.currentPage.getWidgetById(id)
      .evaluatedProps as WebloomContainerProps;
    return <Container {...props}>{children}</Container>;
  },
);
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
  resizingDirection: 'Both',
};
export const WebloomContainerWidget: Widget<WebloomContainerProps> = {
  component: WebloomContainer,
  defaultProps,
  inspectorConfig,
  config,
};
export { WebloomContainer };
