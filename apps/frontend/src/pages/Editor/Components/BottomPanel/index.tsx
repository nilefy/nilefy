import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { QueryPanel } from './queryPanel';
import { DebugPanel } from './debugPanel';

export const BottomPanel = observer(() => {
  const mode = editorStore.bottomPanelMode;
  let ActiveComponent = QueryPanel;
  if (mode === 'debug') {
    ActiveComponent = DebugPanel;
  }
  return (
    <div className="flex h-full w-full">
      <ActiveComponent />
    </div>
  );
});
