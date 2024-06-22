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
import { useSetDom, useSize, useWebloomHover } from '@/lib/Editor/hooks';
import { convertGridToPixel } from '@/lib/Editor/utils';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { toJS } from 'mobx';
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
export const WithModalLayout = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const PositionedComponent: React.FC<P> = (props) => {
    const ref = useRef<HTMLDivElement>(null);
    const id = props.id || EDITOR_CONSTANTS.ROOT_NODE_ID;
    useSetDom(ref, id);
    useWebloomHover(id);
    const widget = editorStore.currentPage.getWidgetById(id);
    const rows = widget.rowsCount;
    const scrollTop = editorStore.currentPage.rootWidget.scrollTop;
    const rootWindow = editorStore.currentPage.rootWidget.dom?.parentElement;
    const domRect = useSize(rootWindow!);
    const height = domRect?.height || 0;
    const numberOfRowsInWindow = Math.floor(
      height / EDITOR_CONSTANTS.ROW_HEIGHT,
    );
    const startRow = numberOfRowsInWindow / 2 - rows / 2;
    const gridDimensions = toJS(widget.gridDimensions);
    gridDimensions.row = startRow;
    const relativePixelDimensions = convertGridToPixel(
      gridDimensions,
      widget.gridSize,
      widget.canvasParent.pixelDimensions,
    );
    const style: CSSProperties = {
      position: 'absolute',
      top: relativePixelDimensions.y + scrollTop,
      left: relativePixelDimensions.x,
      width: relativePixelDimensions.width,
      height: relativePixelDimensions.height,
      visibility: widget.isVisible ? 'visible' : 'hidden',
      zIndex: 100,
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
