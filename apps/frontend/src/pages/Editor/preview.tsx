import { ScrollArea } from '@/components/ui/scroll-area';
import { editorStore } from '@/lib/Editor/Models';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { AppLoader } from './appLoader';
import { WebloomRoot } from './Components/lib';
import { useLayoutEffect, useRef } from 'react';

function PreviewSidebar() {
  const { workspaceId, appId } = useParams();
  const pages = editorStore.pages;

  return (
    <div className="h-full w-full bg-primary/10 ">
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

export function PagePreview() {
  const ref = useRef<HTMLDivElement>(null);
  // NOTE: ask me why do i have to use this
  useLayoutEffect(() => {
    if (ref && ref.current) {
      editorStore.currentPage.setPageDimensions({
        width: Math.round(ref.current.clientWidth),
      });
    }
  }, []);

  return (
    <div
      className="isolate flex h-full max-h-full w-full bg-transparent"
      ref={ref}
    >
      <ScrollArea
        className="h-full w-full"
        scrollAreaViewPortClassName="bg-primary/20 relative touch-none"
      >
        <WebloomRoot isPreview={true} />
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
        <div className="h-full w-full">
          <Outlet />
        </div>
      </div>
    </AppLoader>
  );
}
