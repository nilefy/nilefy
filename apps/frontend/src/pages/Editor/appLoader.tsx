import { commandManager } from '@/actions/CommandManager';
import { AppCompleteT, useAppQuery } from '@/api/apps.api';
import { useJSLibraries } from '@/api/JSLibraries.api';
import { useJSQueries } from '@/api/jsQueries.api';
import { getQueries, useQueriesQuery } from '@/api/queries.api';
import { WebloomLoader } from '@/components/loader';
import { editorStore } from '@/lib/Editor/Models';
import { loaderAuth } from '@/utils/loaders';
import { QueryClient } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';
import { Await, defer, useAsyncValue, useLoaderData } from 'react-router-dom';

export const appLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Record<string, string | undefined> }) => {
    const notAuthed = loaderAuth();
    if (notAuthed) {
      return notAuthed;
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

    const jsQueriesQuery = useJSQueries({
      workspaceId: +(params.workspaceId as string),
      appId: +(params.appId as string),
    });
    const jsLibrariesQuery = useJSLibraries({
      workspaceId: +(params.workspaceId as string),
      appId: +(params.appId as string),
    });
    const values = await Promise.all([
      queryClient.fetchQuery(appQuery),
      queryClient.fetchQuery(queriesQuery),
      queryClient.fetchQuery(jsQueriesQuery),
      queryClient.fetchQuery(jsLibrariesQuery),
    ]);
    const [app, queries, jsQueries, jsLibraries] = values;
    const tree = app.defaultPage.tree;
    editorStore.init({
      name: app.name,
      workspaceId: app.workspaceId,
      appId: app.id,
      queries,
      jsQueries,
      jsLibraries,
      // TODO: get the current user from the token
      currentUser: 'Super User',
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
