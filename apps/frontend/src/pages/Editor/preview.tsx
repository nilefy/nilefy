import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { editorStore } from '@/lib/Editor/Models';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { AppLoader } from './appLoader';
import { WebloomRoot } from './Components/lib';
import { useLayoutEffect, useRef } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import { Edit } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

/*
 * should take full width of the screen
 */
function PreviewHeader() {
  const { workspaceId, appId } = useParams();
  const appName = editorStore.name;
  const pages = editorStore.pages;

  return (
    <div className="flex h-full w-full items-center gap-4 bg-primary/10 p-5">
      <h2>{appName}</h2>
      <NavigationMenu className="gap-5">
        <NavigationMenuList></NavigationMenuList>
        {Object.values(pages).map((page) => {
          return (
            <NavigationMenuItem
              className="hover:border"
              key={page.handle + page.id}
            >
              <NavLink
                to={`/${workspaceId}/apps/${appId}/${page.handle}`}
                className={() => navigationMenuTriggerStyle()}
              >
                {page.name}
              </NavLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenu>
      <div className="ml-auto flex items-center gap-4">
        <Link
          className={buttonVariants({ variant: 'outline', size: 'icon' })}
          to={`/${workspaceId}/apps/edit/${appId}`}
        >
          <Edit className="absolute h-[1.2rem] w-[1.2rem] " />
        </Link>
        <ModeToggle />
      </div>
    </div>
  );
}

export function PagePreview() {
  const ref = useRef<HTMLDivElement>(null);
  // on the editor the initial width comes from the resizable panel(parent of the root) here we do the same to get the initial width of the root from its parent
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
      <div className="flex h-screen w-screen flex-col overflow-hidden ">
        <div className="h-fit w-full">
          <PreviewHeader />
        </div>
        <div className="h-full w-full">
          <Outlet />
        </div>
      </div>
    </AppLoader>
  );
}
