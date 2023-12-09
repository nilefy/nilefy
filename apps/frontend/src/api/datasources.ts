import { fetchX } from '@/utils/fetch';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { z } from 'zod';

export type dataSource = {
  id: string;
  name: string;
  workspaceId: number;
  dataSourceId: number;
  config: unknown;
  createdById: number;
  updatedById: number;
  deletedById: number;
};
const dataSourceMeta = z.object({
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.any()),
});
export type globalDataSource = {
  description: string;
  id: string;
  image: string | unknown;
  name: string;
  type: string;
};

export async function getGlobalDataSources() {
  const res = await fetchX(`data-sources/global`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return (await res.json()) as globalDataSource[];
}

export async function getGlobalDataSource(id: number) {
  const res = await fetchX(`data-sources/global/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return (await res.json()) as globalDataSource;
}
export async function addGlobalDataSource(data: globalDataSource) {
  const res = await fetchX(`data-sources/global`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return (await res.json()) as globalDataSource;
}

export async function getDataSources({ workspaceId }: { workspaceId: number }) {
  const res = await fetchX(`workspaces/${workspaceId}/data-sources`, {
    method: 'GET',
  });
  return (await res.json()) as globalDataSource;
}

export async function getDataSource({
  workspaceId,
  dataSourceId,
}: {
  workspaceId: number;
  dataSourceId: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${dataSourceId}`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as globalDataSource;
}

export async function getDataSourcesSameConnection({
  workspaceId,
  globalDataSourceId,
}: {
  workspaceId: number;
  globalDataSourceId: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${globalDataSourceId}`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as globalDataSource;
}

export async function addDataSource({
  workspaceId,
  dataSourceId,
  data,
}: {
  workspaceId: string | undefined;
  dataSourceId: number;
  data: z.infer<typeof dataSourceMeta>;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${dataSourceId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );
  return (await res.json()) as Partial<dataSource>;
}

export async function updateDataSource({
  workspaceId,
  dataSourceId,
  data,
}: {
  workspaceId: string | undefined;
  dataSourceId: string;
  data: z.infer<typeof dataSourceMeta>;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${dataSourceId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );
  return (await res.json()) as { dataSourceId: string; updatedById: string };
}
export async function deleteDataSource({
  workspaceId,
  dataSourceId,
}: {
  workspaceId: string | undefined;
  dataSourceId: string;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${dataSourceId}`,
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
export async function deleteDataSourcesSameConnection({
  workspaceId,
  globalDataSourceId,
}: {
  workspaceId: string | undefined;
  globalDataSourceId: string;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${globalDataSourceId}`,
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

function useAddGlobalDataSource(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof addGlobalDataSource>>,
    Error,
    Parameters<typeof addGlobalDataSource>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: addGlobalDataSource,
    ...options,
  });
  return mutate;
}
function useGlobalDataSources() {
  return useQuery({
    queryKey: ['globalDataSources'],
    queryFn: () => getGlobalDataSources(),
    staleTime: 0,
  });
}
function useGlobalDataSource(id: number) {
  return useQuery({
    queryKey: ['globalDataSource', { id }],
    queryFn: () => getGlobalDataSource(id),
    staleTime: 0,
  });
}
function useDataSources(workspaceId: number) {
  return useQuery({
    queryKey: ['globalDataSource', { workspaceId }],
    queryFn: () => getDataSources({ workspaceId }),
    staleTime: 0,
  });
}
function useDataSource(workspaceId: number, dataSourceId: number) {
  return useQuery({
    queryKey: ['globalDataSource', { workspaceId, dataSourceId }],
    queryFn: () => getDataSource({ workspaceId, dataSourceId }),
    staleTime: 0,
  });
}
function useDataSourcesSameConnection(
  workspaceId: number,
  globalDataSourceId: number,
) {
  return useQuery({
    queryKey: ['globalDataSource', { workspaceId, globalDataSourceId }],
    queryFn: () =>
      getDataSourcesSameConnection({ workspaceId, globalDataSourceId }),
    staleTime: 0,
  });
}

function useUpdateDataSource(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updateDataSource>>,
    Error,
    Parameters<typeof updateDataSource>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: updateDataSource,
    ...options,
  });
  return mutate;
}

function useAddDataSource(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof addDataSource>>,
    Error,
    Parameters<typeof addDataSource>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: addDataSource,
    ...options,
  });
  return mutate;
}
function useDeleteDataSource(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteDataSource>>,
    Error,
    Parameters<typeof deleteDataSource>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: deleteDataSource,
    ...options,
  });
  return mutate;
}
function useDeleteDataSourcesSameConnection(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteDataSourcesSameConnection>>,
    Error,
    Parameters<typeof deleteDataSourcesSameConnection>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: deleteDataSourcesSameConnection,
    ...options,
  });
  return mutate;
}

export const globalDataSources = {
  index: { useQuery: useGlobalDataSources },
  one: { useQuery: useGlobalDataSource },
  insert: { useMutation: useAddGlobalDataSource },
};
export const dataSources = {
  index: { useQuery: useDataSources },
  one: { useQuery: useDataSource },
  sameConnection: { useQuery: useDataSourcesSameConnection },
  insert: { useMutation: useAddDataSource },
  update: { useMutation: useUpdateDataSource },
  delete: { useMutation: useDeleteDataSource },
  deleteConnections: { useMutation: useDeleteDataSourcesSameConnection },
};
