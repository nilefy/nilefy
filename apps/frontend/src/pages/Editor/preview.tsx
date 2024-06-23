import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { editorStore } from '@/lib/Editor/Models';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { AppLoader, PageLoader } from './appLoader';
import { useRef } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import { Edit } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useSetPageDimensions } from '@/lib/Editor/hooks';
import { WebloomRootProduction } from './Components/lib/WebloomRoot';
import { api } from '@/api';
import { NilefyLoader } from '@/components/loader';
import { observer } from 'mobx-react-lite';

/*
 * should take full width of the screen
 */
function PreviewHeader() {
  const { workspaceId, appId, pageId } = useParams();
  const appName = editorStore.name;
  // const pages = editorStore.pages;
  const {
    data: pages,
    isPending,
    isError,
    error,
  } = api.pages.index.useQuery(+(workspaceId as string), +(appId as string));
  if (isError) {
    throw error;
  } else if (isPending) {
    return <NilefyLoader />;
  }
  return (
    <div className="bg-primary/10 flex h-full w-full items-center gap-4 p-5">
      <h2>{appName}</h2>
      <NavigationMenu className="gap-5">
        <NavigationMenuList></NavigationMenuList>
        {Object.values(pages).map((page) => {
          return (
            <NavigationMenuItem
              // className="hover:border"
              key={page.handle + page.id}
            >
              <NavLink
                to={`./${page.id}`}
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
        {/* <ModeToggle /> */}
      </div>
    </div>
  );
}

export const PagePreview = observer(() => {
  const ref = useRef<HTMLDivElement>(null);
  useSetPageDimensions(ref);
  if (editorStore.isLoadingPage) {
    return <NilefyLoader />;
  }
  return (
    <div ref={ref} className="relative h-full w-full bg-white">
      <PageLoader>
        <WebloomRootProduction isProduction={true} />
      </PageLoader>
    </div>
  );
});

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
