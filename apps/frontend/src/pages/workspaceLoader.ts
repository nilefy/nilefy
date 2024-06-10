import { redirect } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { loaderAuth } from '@/utils/loaders';
import {
  WORKSPACES_QUERY_KEY,
  WorkSpaces,
  indexQueryConfig,
} from '@/api/workspaces.api';

/**
 * getting the workspaces data needs to be done ASAP so i'm doing it in the "root" route then any component under the tree could get it easily with
 *
 * `const { workspaces } = useRouteLoaderData('root');`
 */
export const loader =
  (queryClient: QueryClient) =>
  async ({ request }: { request: Request }) => {
    const notAuthed = loaderAuth();
    if (notAuthed) {
      return notAuthed;
    }
    const query = indexQueryConfig();
    // we cannot operate on the front without having the data of the workspaces so we are doing it in the loader without returning it as a promise
    const workspaces: WorkSpaces =
      queryClient.getQueryData<WorkSpaces>([WORKSPACES_QUERY_KEY]) ??
      (await queryClient.fetchQuery(query));
    const urlPath = new URL(request.url).pathname;
    // only do redirect if user didn't provide workspaceId
    return urlPath === '/' ? redirect(`/${workspaces[0].id}`) : null;
  };
