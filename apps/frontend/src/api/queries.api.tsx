import { FetchXError, fetchX } from '@/utils/fetch';
import {
  UndefinedInitialDataOptions,
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { GlobalDataSourceI, WsDataSourceI } from './dataSources.api';

export type QueryI = {
  id: string;
  order: number;
  /**
   * un-evaluated config
   */
  query: Record<string, unknown>;
  dataSourceId: number;
  appId: number;
  createdById: number;
  updatedById: number;
  createdAt: Date;
  updatedAt: Date | null;
};

export type QueryReturnT = {
  status: number;
  data: unknown;
  error?: string;
};

type RunQueryBody = {
  evaluatedConfig: Record<string, unknown>;
};

export type CompleteQueryI = QueryI & {
  dataSource: Pick<WsDataSourceI, 'id' | 'name'> & {
    dataSource: Pick<GlobalDataSourceI, 'id' | 'name' | 'type' | 'queryConfig'>;
  };
};

export async function getQueries({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: number;
}) {
  const res = await fetchX(`workspaces/${workspaceId}/apps/${appId}/queries`, {
    method: 'GET',
  });
  return (await res.json()) as CompleteQueryI[];
}

export async function getQuery({
  workspaceId,
  appId,
  id,
}: {
  workspaceId: number;
  appId: number;
  id: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/queries/${id}`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as CompleteQueryI;
}

export async function addQuery({
  workspaceId,
  appId,
  dto,
}: {
  workspaceId: number;
  appId: number;
  dto: {
    dataSourceId: number;
    id: QueryI['id'];
    query: QueryI['query'];
    order: QueryI['order'];
  };
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/queries/add`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    },
  );
  return (await res.json()) as CompleteQueryI;
}

async function runQuery({
  workspaceId,
  queryId,
  appId,
  body,
}: {
  workspaceId: number;
  queryId: QueryI['id'];
  appId: QueryI['appId'];
  body: RunQueryBody;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/queries/run/${queryId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  return (await res.json()) as QueryReturnT;
}

export async function updateQuery({
  workspaceId,
  appId,
  queryId,
  dto,
}: {
  workspaceId: number;
  appId: QueryI['appId'];
  queryId: QueryI['id'];
  dto: Partial<{
    dataSourceId: QueryI['dataSourceId'];
    id: QueryI['id'];
    query: QueryI['query'];
  }>;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/queries/${queryId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    },
  );
  return (await res.json()) as CompleteQueryI;
}

export async function deleteQuery({
  workspaceId,
  appId,
  queryId,
}: {
  workspaceId: number;
  appId: QueryI['appId'];
  queryId: QueryI['id'];
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/queries/${queryId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return (await res.json()) as {
    id: string;
  };
}

export function useQueriesQuery(
  workspaceId: number,
  appId: number,
): UndefinedInitialDataOptions<CompleteQueryI[], Error, CompleteQueryI[]> {
  return {
    queryKey: ['queries', { workspaceId, appId }],
    queryFn: async () => {
      const data = await getQueries({ workspaceId, appId });
      return data;
    },
    staleTime: 0,
  };
}

function useQuries(workspaceId: number, appId: number) {
  return useQuery(useQueriesQuery(workspaceId, appId));
}

function useGetQuery(
  workspaceId: number,
  dataSourceId: number,
  appId: number,
  id: number,
) {
  return useQuery({
    queryKey: ['query', { workspaceId, appId, dataSourceId, id }],
    queryFn: () => getQuery({ workspaceId, appId, id }),
    staleTime: 0,
  });
}

function useUpdateQuery(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateQuery>>,
    FetchXError,
    Parameters<typeof updateQuery>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: updateQuery,
    ...options,
  });
  return mutate;
}

function useAddQuery(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof addQuery>>,
    FetchXError,
    Parameters<typeof addQuery>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: addQuery,
    ...options,
  });
  return mutate;
}

function useDeleteQuery(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteQuery>>,
    FetchXError,
    Parameters<typeof deleteQuery>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: deleteQuery,
    ...options,
  });
  return mutate;
}

function useRunQuery(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof runQuery>>,
    FetchXError,
    Parameters<typeof runQuery>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: runQuery,
    ...options,
  });
  return mutate;
}

export const queries = {
  index: { useQuery: useQuries },
  one: { useQuery: useGetQuery },
  insert: { useMutation: useAddQuery },
  update: { useMutation: useUpdateQuery },
  delete: { useMutation: useDeleteQuery },
  run: { useMutation: useRunQuery },
};
