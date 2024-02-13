import { buttonVariants } from '@/components/ui/button';
import { editorStore } from '@/lib/Editor/Models';
import { cn } from '@/lib/cn';
import { observer } from 'mobx-react-lite';
import { Link, useParams } from 'react-router-dom';

export const EditorHeader = observer(function EditorHeader() {
  const { workspaceId, appId } = useParams();
  const appName = editorStore.name;
  const currentPageId = editorStore.currentPageId;
  return (
    <div className="flex h-max w-full items-center gap-5 border-b p-2 ">
      <p>{appName}</p>
      <Link
        className={cn(
          buttonVariants({
            variant: 'outline',
          }),
          'ml-auto',
        )}
        to={`/${workspaceId}/apps/${appId}/${currentPageId}`}
      >
        Deploy
      </Link>
    </div>
  );
});