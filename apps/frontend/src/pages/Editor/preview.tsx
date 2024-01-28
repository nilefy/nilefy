import { ScrollArea } from '@/components/ui/scroll-area';
import { editorStore } from '@/lib/Editor/Models';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { AppLoader } from './appLoader';

function PreviewSidebar() {
  const { workspaceId, appId } = useParams();
  const pages = editorStore.pages;

  return (
    <div className="h-full w-full bg-primary/10">
      <ScrollArea className="h-full w-full">
        {Object.values(pages).map((page) => {
          return (
            <NavLink
              to={`/${workspaceId}/apps/${appId}/${page.handle}`}
              key={page.handle + page.id}
            >
              {page.name}
            </NavLink>
          );
        })}
      </ScrollArea>
    </div>
  );
}

export function AppPreview() {
  return (
    <AppLoader initWs={false}>
      <div className="flex h-screen w-screen">
        <div className="h-full w-1/3">
          <PreviewSidebar />
        </div>
        <Outlet />
      </div>
    </AppLoader>
  );
}
