import { commandManager } from '@/Actions/CommandManager';
import { AppCompleteT, useAppQuery } from '@/api/apps.api';
import { WebloomLoader } from '@/components/loader';
import { editorStore } from '@/lib/Editor/Models';
import { WebloomPage } from '@/lib/Editor/Models/page';
import { seedNameMap } from '@/lib/Editor/widgetName';
import { getToken, removeToken } from '@/lib/token.localstorage';
import { JwtPayload } from '@/types/auth.types';
import { FetchXError } from '@/utils/fetch';
import { QueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { Suspense, useEffect, useRef } from 'react';
import {
  Await,
  defer,
  redirect,
  useAsyncError,
  useAsyncValue,
  useLoaderData,
} from 'react-router-dom';

export const appLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Record<string, string | undefined> }) => {
    // as this loader runs before react renders we need to check for token first
    const token = getToken();
    if (!token) {
      return redirect('/signin');
    } else {
      // check is the token still valid
      // Decode the token
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        removeToken();
        return redirect('/signin');
      }
      const query = useAppQuery({
        workspaceId: +(params.workspaceId as string),
        appId: +(params.appId as string),
      });
      return defer({
        app: queryClient.fetchQuery(query),
      });
    }
  };

type AppLoaderProps = {
  /**
   * does this app needs to connect to websocket connection?
   */
  initWs: boolean;
  children: React.ReactNode;
};

function AppLoadError() {
  const error = useAsyncError() as FetchXError;
  return (
    <div className="h-screen w-screen content-center items-center text-red-500">
      errors while loading app &quot;{error.message}&quot;
    </div>
  );
}

const AppResolved = function AppResolved({ children, initWs }: AppLoaderProps) {
  const app = useAsyncValue() as AppCompleteT;
  const tree = app.defaultPage.tree;
  // todo : put the init state inside the editor store itself
  const inited = useRef(false);
  if (!inited.current) {
    seedNameMap(Object.values(tree));
    editorStore.init({
      currentPageId: app.defaultPage.id.toString(),
      pages: [
        new WebloomPage({
          id: app.defaultPage.id.toString(),
          name: app.defaultPage.name,
          handle: app.defaultPage.handle,
          widgets: tree,
          queries: {},
        }),
      ],
    });
    inited.current = true;
  }
  useEffect(() => {
    if (initWs) commandManager.connectToEditor(app.id, app.defaultPage.id);
    return () => {
      if (initWs) commandManager.disconnectFromConnectedEditor();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
};

export function AppLoader(props: AppLoaderProps) {
  const { app } = useLoaderData();

  return (
    <Suspense fallback={<WebloomLoader />}>
      <Await resolve={app} errorElement={<AppLoadError />}>
        <AppResolved {...props} />
      </Await>
    </Suspense>
  );
}
