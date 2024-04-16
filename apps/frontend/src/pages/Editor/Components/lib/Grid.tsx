import { EDITOR_CONSTANTS } from '@webloom/constants';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { editorStore } from '@/lib/Editor/Models';
import useResizeObserver from '@react-hook/resize-observer';

const Grid = observer(({ id }: { id: string }) => {
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const gridSize = editorStore.currentPage.getWidgetById(id).columnWidth;
  const shown =
    editorStore.currentPage.isDragging || editorStore.currentPage.isResizing;
  const ref = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  useResizeObserver(divRef, (entry) => {
    setDims({
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    });
  });
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = dims.width;
    canvas.height = dims.height;
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
  }, [gridSize, shown, dims.width, dims.height]);
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
