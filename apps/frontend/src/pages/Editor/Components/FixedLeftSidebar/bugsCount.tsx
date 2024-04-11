import { editorStore } from '@/lib/Editor/Models';
import { BugIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';

export const BugsCount = observer(() => {
  const bugsCount = editorStore.currentPageErrorsCount;
  return (
    <div
      className="relative"
      onClick={() => {
        editorStore.setBottomPanelMode('debug');
      }}
    >
      <BugIcon className="h-8 w-8 cursor-pointer" />
      {bugsCount > 0 ? (
        <span className="absolute -right-3 -top-3 h-6 w-6 cursor-pointer select-none rounded-full bg-red-500 text-center leading-5 text-white">
          {bugsCount}
        </span>
      ) : null}
    </div>
  );
});
