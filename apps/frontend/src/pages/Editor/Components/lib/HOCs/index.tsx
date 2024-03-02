import { editorStore } from '@/lib/Editor/Models';
import { useSetDom, useWebloomHover } from '@/lib/Editor/hooks';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { observer } from 'mobx-react-lite';
import { CSSProperties, useRef } from 'react';

export { WithDrag, WithDrop, WithDnd } from './Dnd';
export { WithResize } from './Resize';
export { WithSelection } from './Selection';

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
