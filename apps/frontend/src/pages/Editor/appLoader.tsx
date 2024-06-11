import { commandManager } from '@/actions/CommandManager';
import { AppCompleteT, fetchAppData } from '@/api/apps.api';
import { useJSLibraries } from '@/api/JSLibraries.api';
import { useJSQueries } from '@/api/jsQueries.api';
import { getQueries, useQueriesQuery } from '@/api/queries.api';
import { WebloomLoader } from '@/components/loader';
import { editorStore } from '@/lib/Editor/Models';
import { JwtPayload } from '@/types/auth.types';
import { getUser, loaderAuth } from '@/utils/loaders';
import { QueryClient } from '@tanstack/react-query';
import { when } from 'mobx';
import { Suspense, useEffect } from 'react';
import { Await, defer, useAsyncValue, useLoaderData } from 'react-router-dom';
export const pageLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Record<string, string | undefined> }) => {
    const pageId = params.pageId!;
    const appQuery = fetchAppData({
      workspaceId: +(params.workspaceId as string),
      appId: +(params.appId as string),
      pageId: pageId ? +pageId : undefined,
    });
    const page = await queryClient.fetchQuery(appQuery);
    await when(() => editorStore.initting === false);
    editorStore.changePage({
      id: pageId,
      name: page.name,
      handle: page.id.toString(),
      tree: page.defaultPage.tree,
    });
    return defer({
      values: [pageId],
    });
  };
export const appLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Record<string, string | undefined> }) => {
    const notAuthed = loaderAuth();
    if (notAuthed) {
      return notAuthed;
    }
    const currentUser = getUser() as JwtPayload;
    const workspaceId = params.workspaceId;
    const appId = params.appId;
    const pageId = params.pageId;
    if (!workspaceId || !appId) {
      throw new Error('use this loader under :workspaceId and :appId');
    }
    // Fetch queries
    const queriesQuery = useQueriesQuery(+workspaceId, +appId);

    // Fetch the app data
    const appQuery = fetchAppData({
      workspaceId: +(params.workspaceId as string),
      appId: +(params.appId as string),
      pageId: pageId ? +pageId : undefined,
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
      currentUser: currentUser?.username,
      // TODO: i don't think we should store this info here but whatever right?
      onBoardingCompleted: app.onBoardingCompleted,
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
    // little hack to make sure the editor is initialized
    const data = when(() => editorStore.initting === false).then(() => {
      console.log('editor initialized');
      return values;
    });
    return defer({
      values: data,
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
  const { values } = useLoaderData() as { values: any };

  return (
    <Suspense fallback={<WebloomLoader />}>
      <Await resolve={values}>
        <AppResolved {...props} />
      </Await>
    </Suspense>
  );
}

export function PageLoader({ children }: { children: React.ReactNode }) {
  const { values } = useLoaderData() as { values: any };
  return (
    <Suspense fallback={<WebloomLoader />}>
      <Await resolve={values}>{children}</Await>
    </Suspense>
  );
}
