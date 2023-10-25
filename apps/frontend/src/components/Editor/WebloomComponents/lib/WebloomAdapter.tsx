import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Rnd } from 'react-rnd';
import { useContext, useEffect, useRef } from 'react';
import store from '../../../../store';
import { WebloomContext } from './WebloomContext';
import { GRID_CELL_SIDE } from '../../../../lib/constants';

type WebloomAdapterProps = {
  children: React.ReactNode;
  draggable?: boolean;
  droppable?: boolean;
  resizable?: boolean;
};

const { setDimensions } = store.getState();
export const WebloomAdapter = (props: WebloomAdapterProps) => {
  const { id } = useContext(WebloomContext);
  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: id,
    disabled: !props.droppable,
  });
  const el = store().tree[id];
  const ref = useRef<HTMLDivElement>(null);
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    disabled: !props.draggable,
  });
  useEffect(() => {
    setNodeRef(ref.current);
    setDropNodeRef(ref.current);
  }, [setDropNodeRef, setNodeRef]);
  if (id === 'root') {
    return (
      <div className="h-full w-full" ref={ref}>
        {props.children}
      </div>
    );
  }
  return (
    <>
      <Rnd
        position={{ x: el.x, y: el.y }}
        size={{ width: el.width, height: el.height }}
        onDragStop={(_, d) => {
          setDimensions(id, {
            x: d.x,
            y: d.y,
            width: el.width,
            height: el.height,
          });
        }}
        onResize={
          props.resizable
            ? (_, __, ref, ___, position) => {
                setDimensions(id, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  ...position,
                });
              }
            : undefined
        }
        enableResizing={!!props.resizable}
        bounds={'parent'}
        disableDragging={!props.draggable}
        dragGrid={[GRID_CELL_SIDE, GRID_CELL_SIDE]}
        resizeGrid={[GRID_CELL_SIDE, GRID_CELL_SIDE]}
      >
        {
          <div
            className="h-full w-full"
            {...listeners}
            {...attributes}
            ref={ref}
          >
            {props.children}
          </div>
        }
      </Rnd>
    </>
  );
};
