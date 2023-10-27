import store, { WebloomState } from '@/store';

const { getBoundingRect } = store.getState();

function calcBoundingRect(
  els: WebloomState['selectedNodeIds'],
): ReturnType<typeof getBoundingRect> {
  const dims = [...els].map((id) => getBoundingRect(id));
  const res = {
    top: Math.min(...dims.map((i) => i.top)),
    left: Math.min(...dims.map((i) => i.left)),
    right: Math.max(...dims.map((i) => i.right)),
    bottom: Math.max(...dims.map((i) => i.bottom)),
    width: 0,
    height: 0,
  };
  res.width = res.right - res.left;
  res.height = res.bottom - res.top;
  return res;
}

export function MultiSelectBounding() {
  const selectedIds = store((state) => state.selectedNodeIds);
  if (selectedIds.size < 2) return null;
  const boundingRect = calcBoundingRect(selectedIds);

  console.log(boundingRect);

  return (
    <>
      {/*top*/}
      <div
        className="absolute z-50  border border-dotted border-blue-300 "
        style={{
          width: boundingRect.width + 20,
          height: 0,
          top: boundingRect.top - 10,
          left: boundingRect.left - 10,
        }}
      ></div>

      {/*bottom*/}
      <div
        className="absolute z-50  border border-dotted border-blue-300 "
        style={{
          width: boundingRect.width + 20,
          height: 0,
          top: boundingRect.bottom + 10,
          left: boundingRect.left - 10,
        }}
      ></div>

      {/*right*/}
      <div
        className="absolute z-50 border border-dotted border-blue-300 "
        style={{
          width: 0,
          height: boundingRect.height + 20,
          top: boundingRect.top - 10,
          left: boundingRect.right + 10,
        }}
      ></div>
      {/**/}

      {/*left*/}
      <div
        className="absolute z-50  border border-dotted border-blue-300 "
        style={{
          width: 0,
          height: boundingRect.height + 20,
          top: boundingRect.top - 10,
          left: boundingRect.left - 10,
        }}
      ></div>
    </>
  );
}
