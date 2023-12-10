import { fetchX } from '@/utils/fetch';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { z } from 'zod';

export type query = {
  id: string;
  name: string;
  query: object;
  dataSourceId: number;
  appId: number;
  createdById: number;
  updatedById: number;
};
const dataSourceMeta = z.object({
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.any()),
});

export async function getQueries({
  workspaceId,
  appId,
  dataSourceId,
}: {
  workspaceId: number;
  appId: number;
  dataSourceId: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/datasources/${dataSourceId}/queries`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as query;
}

export async function getQuery({
  workspaceId,
  appId,
  dataSourceId,
  id,
}: {
  workspaceId: number;
  appId: number;
  dataSourceId: number;
  id: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/datasources/${dataSourceId}/queries/${id}`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as query;
}

export async function addQuery({
  workspaceId,
  dataSourceId,
  appId,
  data,
}: {
  workspaceId: string | undefined;
  dataSourceId: number;
  appId: number;
  data: z.infer<typeof dataSourceMeta>;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/datasources/${dataSourceId}/queries/add`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );
  return (await res.json()) as Partial<query>;
}
export async function runQuery({
  workspaceId,
  dataSourceId,
  appId,
  data,
}: {
  workspaceId: string | undefined;
  dataSourceId: number;
  appId: number;
  data: z.infer<typeof dataSourceMeta>;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/datasources/${dataSourceId}/queries/run`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );
  return (await res.json()) as Partial<query>;
}

export async function updateQuery({
  workspaceId,
  dataSourceId,
  appId,
  id,
  data,
}: {
  workspaceId: number;
  appId: number;
  dataSourceId: number;
  id: number;
  data: z.infer<typeof dataSourceMeta>;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/datasources/${dataSourceId}/queries/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );
  return (await res.json()) as { dataSourceId: string; updatedById: string };
}
export async function deleteQuery({
  workspaceId,
  dataSourceId,
  appId,
  id,
}: {
  workspaceId: number;
  appId: number;
  dataSourceId: number;
  id: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/datasources/${dataSourceId}/queries/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return (await res.json()) as {
    dataSourceId: string;
    deletedById: string;
    workspaceId: string;
  };
}

function useQuerys(workspaceId: number, dataSourceId: number, appId: number) {
  return useQuery({
    queryKey: ['queries', { workspaceId, appId, dataSourceId }],
    queryFn: () => getQueries({ workspaceId, appId, dataSourceId }),
    staleTime: 0,
  });
}
function useGetQuery(
  workspaceId: number,
  dataSourceId: number,
  appId: number,
  id: number,
) {
  return useQuery({
    queryKey: ['query', { workspaceId, appId, dataSourceId, id }],
    queryFn: () => getQuery({ workspaceId, appId, dataSourceId, id }),
    staleTime: 0,
  });
}

function useUpdateQuery(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateQuery>>,
    Error,
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
    Error,
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
    Error,
    Parameters<typeof deleteQuery>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: deleteQuery,
    ...options,
  });
  return mutate;
}

export const queries = {
  index: { useQuery: useQuerys },
  one: { useQuery: useGetQuery },
  insert: { useMutation: useAddQuery },
  update: { useMutation: useUpdateQuery },
  delete: { useMutation: useDeleteQuery },
};
