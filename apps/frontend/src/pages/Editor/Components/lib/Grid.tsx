import { ROW_HEIGHT } from '@/lib/Editor/constants';
import store from '@/store';
import { useDndContext } from '@dnd-kit/core';
import { useEffect, useRef } from 'react';

const Grid = ({ id }: { id: string }) => {
  const columnWidth = store((state) => state.tree[id].columnWidth);
  const gridSize = columnWidth!;
  const { active } = useDndContext();
  const resized = store((state) => state.resizedNode);
  const shown = !!active || !!resized;
  const ref = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const divBoundingClientRect = divRef.current!.getBoundingClientRect();
    canvas.width = divBoundingClientRect.width;
    canvas.height = divBoundingClientRect.height;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.setLineDash([2, ROW_HEIGHT]);
    ctx.lineCap = 'round';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < width; i += gridSize) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
    }
    ctx.stroke();
  }, [gridSize, shown]);
  return (
    <div
      ref={divRef}
      className="pointer-events-none absolute left-0 top-0 h-full w-full select-none"
    >
      {shown && <canvas ref={ref}></canvas>}
    </div>
  );
};
export { Grid };
export default Grid;
