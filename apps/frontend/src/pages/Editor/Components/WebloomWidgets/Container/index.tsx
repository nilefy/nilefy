import { editorStore } from '@/lib/Editor/Models';
import {
  Widget,
  WidgetConfig,
  WidgetInspectorConfig,
} from '@/lib/Editor/interface';
import { BoxSelect } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { ReactNode, useContext } from 'react';
import { WidgetContext } from '../..';

type WebloomContainerProps = {
  children?: ReactNode;
  color: string;
  DONTUSE: number;
};

const WebloomContainer = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { id } = useContext(WidgetContext);
    const entity = editorStore.currentPage.getWidgetById(id);
    const props = entity.values as WebloomContainerProps;

    return (
      <div className="relative h-full w-full overflow-auto" data-scroll="true">
        <div
          style={{
            width: '100%',
            backgroundColor: props.color,
            height: entity.innerContainerPixelDimensions.height,
            overflowY: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);

const widgetName = 'WebloomContainer';
export const defaultProps: WebloomContainerProps = {
  color: '#a883f2',
  DONTUSE: Infinity,
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
        key: 'DONTUSE',
        label: 'Height Mode',
        type: 'heightMode',
        options: {
          label: 'Height Mode',
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
