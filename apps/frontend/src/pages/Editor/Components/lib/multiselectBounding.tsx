import { editorStore } from '@/lib/Editor/Models';
import { WebloomPage } from '@/lib/Editor/Models/page';
import { observer } from 'mobx-react-lite';

function calcBoundingRect(els: WebloomPage['selectedNodeIds']) {
  const dims = [...els].map(
    (id) => editorStore.currentPage.getWidgetById(id).boundingRect,
  );
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

export const MultiSelectBounding = observer(() => {
  const selectedIds = editorStore.currentPage.selectedNodeIds;
  // const selectedIds = store((state) => state.selectedNodeIds);

  if (selectedIds.size < 2) return null;
  const boundingRect = calcBoundingRect(selectedIds);

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
});
