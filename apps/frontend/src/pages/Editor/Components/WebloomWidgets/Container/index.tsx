import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
} from '@/lib/Editor/interface';
import { Container } from '../../_Components/Container';
import { BoxSelect } from 'lucide-react';
import { ComponentPropsWithoutRef, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';
import { WidgetContext } from '../..';

type WebloomContainerProps = ComponentPropsWithoutRef<typeof Container>;
const WebloomContainer = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { id } = useContext(WidgetContext);
    const props = editorStore.currentPage.getWidgetById(id)
      .finalValues as WebloomContainerProps;
    return <Container {...props}>{children}</Container>;
  },
);
export const defaultProps: WebloomContainerProps = {
  color: '#a883f2',
};
export const inspectorConfig: EntityInspectorConfig<WebloomContainerProps> = [
  {
    sectionName: 'Color',
    children: [
      {
        path: 'color',
        label: 'Color',
        type: 'color',
        options: {
          color: '#a883f2',
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
