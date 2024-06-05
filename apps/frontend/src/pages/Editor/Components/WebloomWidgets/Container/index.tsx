import {
  EntityInspectorConfig,
  Widget,
  WidgetConfig,
  WIDGET_SECTIONS,
} from '@/lib/Editor/interface';
import { BoxSelect } from 'lucide-react';
import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { editorStore } from '@/lib/Editor/Models';

import { WidgetContext } from '../..';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid } from '../../lib';
import { cn } from '@/lib/cn';

import z from 'zod';

const webloomContainerProps = z.object({
  color: z.string(),
  layoutMode: z.enum(['fixed', 'auto']),
});
export type WebloomContainerProps = z.infer<typeof webloomContainerProps>;

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
        // temporary styles till we implement custom styles
        className={cn('relative h-full w-full', {
          'shadow-md ': !entity.isRoot,
        })}
        scrollAreaViewPortClassName={cn({
          hidden: !isVisibile,
          'rounded-md border border-gray-200': !entity.isRoot,
        })}
        style={{
          ...outerContainerStyle,
          left: leftRootShift / 2,
          visibility: isVisibile ? 'visible' : 'hidden',
        }}
      >
        <div
          className="relative bg-gray-100"
          data-id={id}
          data-testid={id}
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
export const initialProps: WebloomContainerProps = {
  color: 'white',
  layoutMode: 'fixed',
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
          color: 'white',
        },
      },
    ],
  },
  {
    sectionName: 'Layout',
    children: [
      {
        path: 'layoutMode',
        label: 'Layout Mode',
        type: 'select',
        options: {
          items: [
            { value: 'fixed', label: 'Fixed' },
            { value: 'auto', label: 'Auto' },
          ],
        },
      },
    ],
  },
];

export const config: WidgetConfig = {
  name: 'Container',
  icon: BoxSelect,
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
  initialProps,
  inspectorConfig,
  config,
};
export { WebloomContainer };
