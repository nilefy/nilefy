import { editorStore } from '@/lib/Editor/Models';
import {
  LayoutMode,
  WIDGET_SECTIONS,
  Widget,
  WidgetConfig,
  WidgetInspectorConfig,
} from '@/lib/Editor/interface';
import { BoxSelect } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { ReactNode, useContext } from 'react';
import { WidgetContext } from '../..';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid } from '../../lib';
import { cn } from '@/lib/cn';

type WebloomContainerProps = {
  children?: ReactNode;
  color: string;
  layoutMode: LayoutMode;
};
const WebloomContainer = observer(
  ({
    children,
    innerContainerStyle,
    outerContainerStyle,
    isVisibile = true,
  }: {
    children: React.ReactNode;
    innerContainerStyle: {
      width: string;
      height: string;
    };
    outerContainerStyle: {
      width: string;
      height: string;
    };
    isVisibile: boolean;
  }) => {
    const { id } = useContext(WidgetContext);
    const entity = editorStore.currentPage.getWidgetById(id);
    const props = entity.values as WebloomContainerProps;
    // TODO: This feels bad but what this basically does is center the root to look pwetty
    const leftRootShift = entity.isRoot
      ? editorStore.currentPage.width -
        entity.innerContainerPixelDimensions.width
      : 0;

    return (
      <ScrollArea
        className="relative h-full w-full"
        scrollAreaViewPortClassName={cn({
          hidden: !isVisibile,
          'rounded-md': !entity.isRoot,
        })}
        style={{
          ...outerContainerStyle,
          left: leftRootShift / 2,
          visibility: isVisibile ? 'visible' : 'hidden',
        }}
      >
        <div
          className="relative bg-gray-300"
          data-id={id}
          data-type={WIDGET_SECTIONS.CANVAS}
          style={{
            ...innerContainerStyle,
            visibility: isVisibile ? 'visible' : 'hidden',
            backgroundColor: props.color,
          }}
        >
          <Grid id={id} />
          {children}
        </div>
      </ScrollArea>
    );
  },
);

const widgetName = 'WebloomContainer';
export const defaultProps: WebloomContainerProps = {
  color: '#a883f2',
  layoutMode: 'fixed',
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
        key: 'layoutMode',
        label: 'Height Mode',
        type: 'select',
        options: {
          items: [
            { label: 'Fixed', value: 'fixed' },
            { label: 'Auto', value: 'auto' },
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
    colsCount: 10,
    rowsCount: 30,
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
