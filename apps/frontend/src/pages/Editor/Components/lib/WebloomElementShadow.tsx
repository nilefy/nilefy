import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';

export const WebloomElementShadow = observer(() => {
  const shadow = editorStore.currentPage.shadowElement;
  if (!shadow) return null;
  return (
    <div
      className="pointer-events-none select-none bg-gray-500 opacity-50"
      style={{
        position: 'fixed',
        zIndex: '100',
        top: shadow.y,
        left: shadow.x,
        width: shadow.width,
        height: shadow.height,
      }}
    />
  );
});
