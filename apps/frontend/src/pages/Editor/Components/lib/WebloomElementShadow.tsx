// import store from '@/store';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';

export const WebloomElementShadow = observer(() => {
  const shadow = editorStore.currentPage.shadowElement;
  // const shadow = store((state) => state.shadowElement);
  if (!shadow) return null;
  return <ElementShadow {...shadow} />;
});

function ElementShadow({
  width,
  height,
  x,
  y,
}: {
  width: number;
  height: number;
  x: number;
  y: number;
}) {
  return (
    <div
      key={'shadown'}
      className="absolute z-50 bg-gray-500 opacity-50"
      style={{
        width: width,
        height: height,
        transform: `translate(${x}px, ${y}px)`,
      }}
    ></div>
  );
}
