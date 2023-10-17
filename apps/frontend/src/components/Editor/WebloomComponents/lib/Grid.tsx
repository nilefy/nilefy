import { useDndContext } from '@dnd-kit/core';
import { useEffect, useRef } from 'react';

export const Grid = ({ gridSize }: { gridSize: number }) => {
  //grid line width is 1px
  const { active } = useDndContext();

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
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < width; i += gridSize) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
    }

    ctx.stroke();
  }, [gridSize, active]);
  return (
    <div
      ref={divRef}
      className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full select-none"
    >
      {!!active && <canvas ref={ref}></canvas>}
    </div>
  );
};