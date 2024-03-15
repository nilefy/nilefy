import { ResizeHandles } from '../ResizeHandlers';
import { WIDGET_SECTIONS } from '@/lib/Editor/interface';

export const WithResize = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const ResizableComponent: React.FC<P> = (props) => {
    return (
      <div
        className="relative h-full w-full"
        data-type={WIDGET_SECTIONS.RESIZER}
      >
        <ResizeHandles id={props.id} />
        <WrappedComponent {...props} />
      </div>
    );
  };
  return ResizableComponent;
};
