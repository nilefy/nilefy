import { globalDataSourcesQuery } from '@/api/dataSources.api';
import { loaderAuth } from '@/utils/loaders';
import { QueryClient } from '@tanstack/react-query';
import { defer } from 'react-router-dom';

export const globalDataSourcesLoader =
  (queryClient: QueryClient) =>
  async ({ params }: { params: Record<string, string | undefined> }) => {
    const notAuthed = loaderAuth();
    if (notAuthed) {
      return notAuthed;
    }
    const workspaceId = params.workspaceId;
    if (!workspaceId) {
      throw new Error('use this loader under :workspaceId');
    }

    const globalDss = globalDataSourcesQuery();
    return defer({
      globalDataSources: queryClient.fetchQuery(globalDss),
    });
  };
