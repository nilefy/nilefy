import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import {
  useFloating,
  autoUpdate,
  flip,
  shift,
  offset,
} from '@floating-ui/react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
export const WithPopover = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const DraggableComponent: React.FC<P> = (props) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    const widget = editorStore.currentPage.getWidgetById(props.id);
    const isActive = widget.isHovered || widget.isTheOnlySelected;

    const { floatingStyles, update } = useFloating({
      open: isActive,
      nodeId: widget.id,

      placement: 'top-end',
      middleware: [
        flip({ fallbackAxisSideDirection: 'end' }),
        shift(),
        offset({
          mainAxis: 1,
          crossAxis: 1,
        }),
      ],

      elements: {
        reference: widget.dom,
        floating: popoverRef.current,
      },
    });
    useEffect(() => {
      let cleanup = () => {};
      if (isActive && popoverRef.current && widget.dom && update) {
        cleanup = autoUpdate(widget.dom, popoverRef.current, update);
      }
      return cleanup;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, update, widget.dom, popoverRef.current]);
    return (
      <>
        <div
          ref={popoverRef}
          style={floatingStyles}
          className={cn('w-max bg-blue-400 p-1 text-center text-xs', {
            hidden: !isActive,
          })}
        >
          {widget.id}
        </div>

        <WrappedComponent {...props} />
      </>
    );
  };
  return observer(DraggableComponent);
};
