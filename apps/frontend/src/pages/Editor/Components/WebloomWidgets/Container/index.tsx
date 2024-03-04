import zodToJsonSchema from 'zod-to-json-schema';
import { Widget, WidgetConfig, WIDGET_SECTIONS } from '@/lib/Editor/interface';
import { BoxSelect } from 'lucide-react';
import { WidgetInspectorConfig } from '@/lib/Editor/interface';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';

import { useContext } from 'react';
import { WidgetContext } from '../..';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid } from '../../lib';
import { cn } from '@/lib/cn';

import z from 'zod';

const webloomContainerProps = z.object({
  color: z.string(),
  layoutMode: z.enum(['fixed', 'auto']),
});
type WebloomContainerProps = z.infer<typeof webloomContainerProps>;

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
    const props = entity.finalValues as WebloomContainerProps;
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

export const schema: WidgetInspectorConfig = {
  dataSchema: zodToJsonSchema(webloomContainerProps) as RJSFSchema,
  uiSchema: {
    color: {
      'ui:widget': 'colorPicker',
      'ui:title': 'Color',
    },
  },
};

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
  schema,
  config,
};
export { WebloomContainer };
