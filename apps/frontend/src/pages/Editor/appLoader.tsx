import { commandManager } from '@/Actions/CommandManager';
import { AppCompleteT, useAppQuery } from '@/api/apps.api';
import { getQueries, useQueriesQuery } from '@/api/queries.api';
import { WebloomLoader } from '@/components/loader';
import { editorStore } from '@/lib/Editor/Models';

import { getToken, removeToken } from '@/lib/token.localstorage';
import { JwtPayload } from '@/types/auth.types';
import { QueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { Suspense, useEffect } from 'react';
import {
  Await,
  defer,
  redirect,
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
      const workspaceId = params.workspaceId;
      const appId = params.appId;
      if (!workspaceId || !appId) {
        throw new Error('use this loader under :workspaceId and :appId');
      }
      // Fetch queries
      const queriesQuery = useQueriesQuery(+workspaceId, +appId);

      // Fetch the app data
      const appQuery = useAppQuery({
        workspaceId: +(params.workspaceId as string),
        appId: +(params.appId as string),
      });
      const values = await Promise.all([
        queryClient.fetchQuery(appQuery),
        queryClient.fetchQuery(queriesQuery),
      ]);
      const [app, queries] = values;
      const tree = app.defaultPage.tree;
      editorStore.init({
        name: app.name,
        queries,
        currentPageId: app.defaultPage.id.toString(),
        pages: [
          {
            id: app.defaultPage.id.toString(),
            name: app.defaultPage.name,
            handle: app.defaultPage.handle,
            widgets: tree,
          },
          ...app.pages.map((p) => ({
            id: p.id.toString(),
            name: p.name,
            handle: p.handle,
          })),
        ],
      });
      return defer({
        values,
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

const AppResolved = function AppResolved({ children, initWs }: AppLoaderProps) {
  const [app] = useAsyncValue() as [
    app: AppCompleteT,
    queries: Awaited<ReturnType<typeof getQueries>>,
  ];

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
  const { values } = useLoaderData();

  return (
    <Suspense fallback={<WebloomLoader />}>
      <Await resolve={values}>
        <AppResolved {...props} />
      </Await>
    </Suspense>
  );
}
