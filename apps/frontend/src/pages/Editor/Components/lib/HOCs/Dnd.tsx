import { useWebloomDrag, useWebloomDrop } from '@/lib/Editor/hooks';
import { flow } from 'lodash';

export const WithDrag = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const DraggableComponent: React.FC<P> = (props) => {
    useWebloomDrag({
      id: props.id,
      isNew: false,
    });

    return <WrappedComponent {...props} />;
  };
  return DraggableComponent;
};

export const WithDrop = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const DropCanvasComponent: React.FC<P> = (props) => {
    useWebloomDrop(props.id);
    return <WrappedComponent {...props} />;
  };
  return DropCanvasComponent;
};

export const WithDnd = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  return flow(WithDrag, WithDrop)(WrappedComponent);
};
