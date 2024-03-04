import { editorStore } from '@/lib/Editor/Models';
import { ElementType, useCallback, useMemo } from 'react';
import { WebloomWidgets, WidgetContext } from '..';

import { observer } from 'mobx-react-lite';
import { cn } from '@/lib/cn';
import { WIDGET_SECTIONS } from '@/lib/Editor/interface';
import { WebloomContainer } from '../WebloomWidgets/Container';
import { flow, flowRight } from 'lodash';
import {
  WithDeletePopover,
  WithDnd,
  WithLayout,
  WithResize,
  WithSelection,
} from './HOCs';

const RenderedElement = observer(
  ({ id, isVisible }: { id: string; isVisible: boolean }) => {
    const widget = editorStore.currentPage.getWidgetById(id);
    if (widget.type === 'WebloomContainer') {
      const innerContainerStyle = {
        width: widget.innerContainerPixelDimensions.width + 'px',
        height: widget.innerContainerPixelDimensions.height + 'px',
      } as const;
      const outerContainerStyle = {
        width: widget.relativePixelDimensions.width + 'px',
        height: widget.relativePixelDimensions.height + 'px',
      } as const;

      return (
        <WebloomContainer
          innerContainerStyle={innerContainerStyle}
          outerContainerStyle={outerContainerStyle}
          isVisibile={isVisible}
        >
          {widget.nodes.map((nodeId) => (
            <WebloomElement id={nodeId} key={nodeId} />
          ))}
        </WebloomContainer>
      );
    }
    const WebloomWidget = WebloomWidgets[widget.type].component as ElementType;
    return (
      <WidgetWrapper id={id} isVisible={isVisible}>
        <WebloomWidget>
          {widget.nodes.map((nodeId) => (
            <WebloomElement id={nodeId} key={nodeId} />
          ))}
        </WebloomWidget>
      </WidgetWrapper>
    );
  },
);

export const WebloomElementBase = observer(function WebloomElement({
  id,
}: {
  id: string;
}) {
  const widget = editorStore.currentPage.getWidgetById(id);
  const onPropChange = useCallback(
    ({ value, key }: { value: unknown; key: string }) => {
      widget.setValue(key, value);
    },
    [widget],
  );
  const contextValue = useMemo(() => {
    return {
      onPropChange,
      id,
    };
  }, [onPropChange, id]);

  const isVisible = widget.isVisible;

  return (
    <WidgetContext.Provider value={contextValue}>
      <RenderedElement id={id} isVisible={isVisible} />
    </WidgetContext.Provider>
  );
});

const WidgetWrapper = observer(
  // eslint-disable-next-line react/display-name
  ({
    id,
    children,
    isVisible,
  }: {
    id: string;
    children: React.ReactNode;
    isVisible: boolean;
  }) => {
    return (
      <div
        style={{
          visibility: isVisible ? 'visible' : 'hidden',
        }}
        className="target relative h-full w-full touch-none overflow-hidden outline-none"
        data-id={id}
        data-type={WIDGET_SECTIONS.CANVAS}
      >
        {
          //this is to prevent widgets from capturing focus when drag is happening
          (editorStore.currentPage.isDragging ||
            editorStore.currentPage.isResizing) && (
            <div className="absolute left-0 top-0 z-10 h-full w-full"></div>
          )
        }
        <div
          key={id}
          className={cn(
            {
              hidden: !isVisible,
            },
            {
              flex: isVisible,
            },
            'w-full h-full',
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);
export const ProductionWebloomElement: React.FC<{ id: string }> =
  flow(WithLayout)(WebloomElementBase);

export const WebloomElement: React.FC<{ id: string }> = flowRight(
  WithLayout,
  WithResize,
  WithDnd,
  WithSelection,
  WithDeletePopover,
)(WebloomElementBase);
