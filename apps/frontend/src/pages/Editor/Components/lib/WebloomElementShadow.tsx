import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';

export const WebloomElementShadow = observer(() => {
  const shadow = editorStore.currentPage.shadowElement;
  if (!shadow) return null;
  return (
    <div
      className="pointer-events-none box-border select-none border-t-[3px] border-t-blue-500 bg-black bg-opacity-10"
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
