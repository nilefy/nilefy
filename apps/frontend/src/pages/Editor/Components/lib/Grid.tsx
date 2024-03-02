import { EDITOR_CONSTANTS } from '@webloom/constants';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import { editorStore } from '@/lib/Editor/Models';

const Grid = observer(({ id }: { id: string }) => {
  const gridSize = editorStore.currentPage.getWidgetById(id).columnWidth;
  const shown =
    editorStore.currentPage.isDragging || editorStore.currentPage.isResizing;
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
    ctx.setLineDash([2, EDITOR_CONSTANTS.ROW_HEIGHT]);
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
      data-type="GRID"
    >
      {shown && <canvas ref={ref}></canvas>}
    </div>
  );
});
export { Grid };
export default Grid;
