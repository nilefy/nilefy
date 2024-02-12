import { editorStore } from '@/lib/Editor/Models';
import {
  Widget,
  WidgetConfig,
  WidgetInspectorConfig,
} from '@/lib/Editor/interface';
import { BoxSelect } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { ComponentPropsWithoutRef, useContext, useRef } from 'react';
import { WidgetContext } from '../..';
import { Container } from '../../_Components/Container';

type WebloomContainerProps = ComponentPropsWithoutRef<typeof Container> & {
  heightMode: 'auto' | 'fixed' | 'limited';
  innerHeight: number;
  dynamicMinHeight?: number;
  dynamicMaxHeight?: number;
};
const WebloomContainer = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { id } = useContext(WidgetContext);
    const entity = editorStore.currentPage.getWidgetById(id);
    const props = entity.values as WebloomContainerProps;
    // let tallestChildHeight = editorStore.currentPage.getWidgetById(
    //   children[0].props.id,
    // ).rowsCount;
    // console.log(tallestChildHeight);
    // forEach(children, (ch) => {
    //   const child = editorStore.currentPage.getWidgetById(ch.props.id);
    //   console.log('child', child.rowsCount);
    //   if (child.rowsCount > tallestChildHeight) {
    //     tallestChildHeight = child.rowsCount;
    //     widget.setTallestChildHeight(tallestChildHeight);
    //     console.log('updating', widget.tallestChild);
    //   }
    // });

    // const enableAutoHeight = useMemo(() => {
    //   switch (props.dynamicHeight) {
    //     case 'auto':
    //       return true;
    //     case 'limited':
    //       return true;
    //     case 'fixed':
    //     default:
    //       return false;
    //   }
    // }, [props.dynamicHeight]);

    return (
      <div className="relative h-full w-full overflow-auto" data-scroll="true">
        <Container
          {...props}
          height={entity.innerContainerPixelDimensions.height}
        >
          {children}
        </Container>
      </div>
    );
  },
);
const widgetName = 'WebloomContainer';
export const defaultProps: WebloomContainerProps = {
  color: '#a883f2',
  heightMode: 'fixed',
  innerHeight: 10,
};
export const inspectorConfig: WidgetInspectorConfig<WebloomContainerProps> = [
  {
    sectionName: 'Color',
    children: [
      {
        id: `${widgetName}-color`,
        key: 'color',
        label: 'Color2',
        type: 'color',
        options: {
          color: '#a883f2',
        },
      },
      {
        id: `${widgetName}-dynamicHeight`,
        key: 'heightMode',
        label: 'Height',
        type: 'select',
        options: {
          items: [
            { value: 'fixed', label: 'Fixed' },
            { value: 'auto', label: 'Auto' },
            { value: 'limited', label: 'Limited' },
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
    layoutMode: 'fixed',
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
