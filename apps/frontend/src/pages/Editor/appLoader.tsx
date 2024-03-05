import { commandManager } from '@/Actions/CommandManager';
import { AppCompleteT, useAppQuery } from '@/api/apps.api';
import { getQueries, useQueriesQuery } from '@/api/queries.api';
import { WebloomLoader } from '@/components/loader';
import { editorStore } from '@/lib/Editor/Models';
import { loaderAuth } from '@/utils/loaders';
import { QueryClient } from '@tanstack/react-query';
import { Suspense, useEffect, useRef } from 'react';
import {
  Await,
  defer,
  useAsyncValue,
  useLoaderData,
  useParams,
} from 'react-router-dom';
import { queryClient } from '@/index';

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
    const values = Promise.all([
      queryClient.fetchQuery(appQuery),
      queryClient.fetchQuery(queriesQuery),
    ]);
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
  const { workspaceId, appId } = useParams();
  const [app, queries] = useAsyncValue() as [
    app: AppCompleteT,
    queries: Awaited<ReturnType<typeof getQueries>>,
  ];
  const tree = app.defaultPage.tree;
  // todo : put the init state inside the editor store itself
  const inited = useRef(false);
  if (!inited.current) {
    editorStore.init({
      workspaceId: +(workspaceId as string),
      appId: +(appId as string),
      queryClient,
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
  const { values } = useLoaderData();

  return (
    <Suspense fallback={<WebloomLoader />}>
      <Await resolve={values}>
        <AppResolved {...props} />
      </Await>
    </Suspense>
  );
}
