import { editorStore } from '@/lib/Editor/Models';
import {
  ElementType,
  RefObject,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { WebloomWidgets, WidgetContext } from '..';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { commandManager } from '@/Actions/CommandManager';
import { DeleteAction } from '@/Actions/Editor/Delete';
import { observer } from 'mobx-react-lite';
import { cn } from '@/lib/cn';
import { WebloomPixelDimensions } from '@/lib/Editor/interface';
import { WebloomContainer } from '../WebloomWidgets/Container';
import { useSetDom, useWebloomDrag, useWebloomDrop } from '@/lib/Editor/hooks';
import { ResizeHandles } from './ResizeHandlers';
import { SelectionAction } from '@/Actions/Editor/selection';

const useInitSelection = (ref: RefObject<HTMLDivElement>, id: string) => {
  const select = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      commandManager.executeCommand(new SelectionAction(id, false));
    },
    [id],
  );
  useEffect(() => {
    const curRef = ref.current;
    if (curRef) {
      curRef.addEventListener('click', select);
    }
    return () => {
      if (curRef) {
        curRef.removeEventListener('click', select);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current, select]);
};
const RenderedElement = observer(
  // eslint-disable-next-line react/display-name
  forwardRef<
    HTMLDivElement,
    {
      id: string;
      isVisible: boolean;
      isPreview: boolean;
    }
  >(({ id, isVisible, isPreview }, ref) => {
    const widget = editorStore.currentPage.getWidgetById(id);
    if (widget.type === 'WebloomContainer') {
      const innerContainerStyle = {
        width: widget.innerContainerPixelDimensions.width + 'px',
        height: widget.innerContainerPixelDimensions.height + 'px',
      } as const;
      const outerContainerStyle = {
        top: widget.relativePixelDimensions.y + 'px',
        left: widget.relativePixelDimensions.x + 'px',
        width: widget.relativePixelDimensions.width + 'px',
        height: widget.relativePixelDimensions.height + 'px',
      } as const;

      return (
        <>
          <ResizeHandles id={id} />

          <WebloomContainer
            innerContainerStyle={innerContainerStyle}
            outerContainerStyle={outerContainerStyle}
            isVisibile={isVisible}
            ref={ref}
          >
            {widget.nodes.map((nodeId) => (
              <WebloomElement id={nodeId} key={nodeId} isPreview={isPreview} />
            ))}
          </WebloomContainer>
        </>
      );
    }
    const WebloomWidget = WebloomWidgets[widget.type].component as ElementType;
    return (
      <>
        <ResizeHandles id={id} />

        <WidgetWrapper
          dimensions={widget.relativePixelDimensions}
          id={id}
          isVisible={isVisible}
          ref={ref}
        >
          <WebloomWidget>
            {widget.nodes.map((nodeId) => (
              <WebloomElement id={nodeId} key={nodeId} isPreview={isPreview} />
            ))}
          </WebloomWidget>
        </WidgetWrapper>
      </>
    );
  }),
);
RenderedElement.displayName = 'RenderedElement';
export const WebloomElement = observer(function WebloomElement({
  id,
  isPreview,
}: {
  id: string;
  isPreview: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = editorStore.currentPage.getWidgetById(id);
  const onPropChange = useCallback(
    ({ value, key }: { value: unknown; key: string }) => {
      widget.setProp(key, value);
    },
    [widget],
  );
  const contextValue = useMemo(() => {
    return {
      onPropChange,
      id,
    };
  }, [onPropChange, id]);
  const [{ isDragging }, drag] = useWebloomDrag({
    id,
    isNew: false,
  });
  const drop = useWebloomDrop(id);
  useEffect(() => {
    if (ref.current) {
      drag(drop(ref.current));
    }
    return () => {
      drag(null);
      drop(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drop, drag, ref, ref.current]);
  const isVisible = !isDragging;
  useSetDom(ref, id);
  useInitSelection(ref, id);

  if (isPreview)
    return (
      <RenderedElement
        id={id}
        isPreview={false}
        isVisible={isVisible}
        ref={ref}
      />
    );
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <WidgetContext.Provider value={contextValue}>
          <RenderedElement
            id={id}
            isPreview={false}
            isVisible={isVisible}
            ref={ref}
          />
        </WidgetContext.Provider>
      </ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent>
          <ContextMenuItem
            onMouseDown={() => {
              commandManager.executeCommand(new DeleteAction());
            }}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenu>
  );
});

const WidgetWrapper = observer(
  // eslint-disable-next-line react/display-name
  forwardRef<
    HTMLDivElement,
    {
      id: string;
      children: React.ReactNode;
      isVisible: boolean;
      dimensions: WebloomPixelDimensions;
    }
  >(({ id, children, isVisible, dimensions }, ref) => {
    return (
      <div
        style={{
          top: dimensions.y,
          left: dimensions.x,
          width: dimensions.width,
          height: dimensions.height,
          visibility: isVisible ? 'visible' : 'hidden',
          position: 'absolute',
        }}
        className="target touch-none overflow-hidden outline-none"
        data-id={id}
        ref={ref}
      >
        {
          //this is to prevent widgets from capturing focus when drag is happening
          editorStore.currentPage.isDragging && (
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
  }),
);

WidgetWrapper.displayName = 'WidgetWrapper';
