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
import { useEffect, useRef } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import { Edit } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useSetPageDimensions } from '@/lib/Editor/hooks';
import { WebloomRootProduction } from './Components/lib/WebloomRoot';
import { runInAction } from 'mobx';

/*
 * should take full width of the screen
 */
function PreviewHeader() {
  const { workspaceId, appId, pageId } = useParams();
  const appName = editorStore.name;
  const pages = editorStore.pages;

  return (
    <div className="bg-primary/10 flex h-full w-full items-center gap-4 p-5">
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
          to={`/${workspaceId}/apps/edit/${appId}/${pageId}`}
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
  useSetPageDimensions(ref);
  useEffect(() => {
    runInAction(() => {
      editorStore.environment = 'production';
    });
  }, []);
  return (
    <div ref={ref} className="relative h-full w-full bg-white">
      <WebloomRootProduction isProduction={true} />
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
