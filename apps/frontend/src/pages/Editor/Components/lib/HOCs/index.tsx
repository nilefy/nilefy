import { commandManager } from '@/actions/CommandManager';
import { DeleteAction } from '@/actions/editor/Delete';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { editorStore } from '@/lib/Editor/Models';
import { useSetDom, useWebloomHover } from '@/lib/Editor/hooks';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { observer } from 'mobx-react-lite';
import { CSSProperties, useRef } from 'react';

export { WithDrag, WithDrop, WithDnd } from './Dnd';
export { WithResize } from './Resize';
export { WithSelection } from './Selection';
export { WithPopover } from './Popover';
export const WithLayout = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const PositionedComponent: React.FC<P> = (props) => {
    const ref = useRef<HTMLDivElement>(null);
    const id = props.id || EDITOR_CONSTANTS.ROOT_NODE_ID;
    useSetDom(ref, id);
    useWebloomHover(id);
    const widget = editorStore.currentPage.getWidgetById(id);
    const relativePixelDimensions = widget.relativePixelDimensions;
    const style: CSSProperties = {
      position: 'absolute',
      top: relativePixelDimensions.y,
      left: relativePixelDimensions.x,
      width: relativePixelDimensions.width,
      height: relativePixelDimensions.height,
      visibility: widget.isVisible ? 'visible' : 'hidden',
    } as const;
    return (
      <div ref={ref} style={style}>
        <WrappedComponent {...{ ...props, id }} />
      </div>
    );
  };
  return observer(PositionedComponent);
};

export const WithNoTextSelection = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const NoTextSelectionComponent: React.FC<P> = (props) => {
    return (
      <div className="relative h-full w-full select-none">
        <WrappedComponent {...props} />
      </div>
    );
  };
  return NoTextSelectionComponent;
};

export const WithDeletePopover = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const DeletePopoverComponent: React.FC<P> = (props) => {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <WrappedComponent {...props} />
        </ContextMenuTrigger>
        <ContextMenuPortal>
          <ContextMenuContent>
            <ContextMenuItem
              onMouseDown={() => {
                commandManager.executeCommand(new DeleteAction(props.id));
              }}
            >
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenuPortal>
      </ContextMenu>
    );
  };
  return DeletePopoverComponent;
};
