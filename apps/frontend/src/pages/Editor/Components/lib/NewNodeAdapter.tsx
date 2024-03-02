import { useWebloomDragCore } from '@/lib/Editor/hooks';
import { WidgetTypes } from '..';

type DraggableProps = {
  children: React.ReactNode;
  type: WidgetTypes;
};
export const NewNodeAdapter = (props: DraggableProps) => {
  const [, drag] = useWebloomDragCore({
    isNew: true,
    type: props.type,
  });

  return (
    <div ref={drag} className="relative z-50 ">
      {props.children}
    </div>
  );
};

export default NewNodeAdapter;
