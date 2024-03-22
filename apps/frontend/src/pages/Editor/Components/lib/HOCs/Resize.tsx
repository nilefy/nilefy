import { observer } from 'mobx-react-lite';
import { ResizeHandles } from '../ResizeHandlers';
import { WIDGET_SECTIONS } from '@/lib/Editor/interface';
import { editorStore } from '@/lib/Editor/Models';

export const WithResize = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const ResizableComponent: React.FC<P> = (props) => {
    const widget = editorStore.currentPage.getWidgetById(props.id);
    const isActive = widget.isHovered || widget.isSelected;
    return (
      <div
        className="relative z-50 h-full w-full"
        data-type={WIDGET_SECTIONS.RESIZER}
        style={{
          boxShadow: isActive ? '0 0 0 1px #a9c0ff' : 'none',
        }}
      >
        <ResizeHandles id={props.id} />
        <WrappedComponent {...props} />
      </div>
    );
  };
  return observer(ResizableComponent);
};
