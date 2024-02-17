import { Button } from '@/components/ui/button';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';

export const DebugPanel = observer(function DebugPanel() {
  const errors = editorStore.currentPageErrors;
  return (
    <div className="flex flex-col gap-4">
      {errors.map((err, i) => {
        return (
          <p key={`err${err.entityId}${i}`}>
            in widget{' '}
            <Button
              variant={'link'}
              onClick={() =>
                editorStore.currentPage.setSelectedNodeIds(
                  () => new Set([err.entityId]),
                )
              }
            >
              <span className="font-bold">{err.entityId}</span>
            </Button>{' '}
            {'path '}
            <span className="font-bold">{err.path}</span>: {err.error}
          </p>
        );
      })}
    </div>
  );
});
