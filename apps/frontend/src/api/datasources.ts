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

export async function getDataSources({
  workspaceId,
}: {
  workspaceId: string | undefined;
}) {
  const res = await fetchX(`workspaces/${workspaceId}/data-sources`, {
    method: 'GET',
  });
  return (await res.json()) as globalDataSource;
}

export async function getGlobalDataSources() {
  const res = await fetchX(`data-sources/global`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return (await res.json()) as dataSource;
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

export async function addDataSource({
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
  );
  return (await res.json()) as Partial<dataSource>;
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
