import { FetchXError, fetchX } from '@/utils/fetch';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import z from 'zod';

export const DATASOURCES_QUERY_KEY = 'datasources';

export const dataSourceMeta = z.object({
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.unknown()),
});

export type DataSourceMeta = z.infer<typeof dataSourceMeta>;

export type PluginConfigT = {
  schema: RJSFSchema;
  uiSchema: UiSchema;
};

export type GlobalDataSourceI = {
  id: number;
  name: string;
  description: string | null;
  type: 'database' | 'api' | 'cloud storage' | 'plugin';
  image: string | null;
  config: PluginConfigT;
  queryConfig: PluginConfigT;
};

export type WsDataSourceI = {
  id: number;
  name: string;
  workspaceId: number;
  config: Record<string, unknown>;
  /**
   * global datasource id
   */
  dataSourceId: number;
};

async function GlobalDataSourceIndex() {
  const res = await fetchX(`data-sources/global`, {
    method: 'GET',
  });
  return (await res.json()) as GlobalDataSourceI[];
}

async function index({ workspaceId }: { workspaceId: number }) {
  const res = await fetchX(`workspaces/${workspaceId}/data-sources`, {
    method: 'GET',
  });
  return (await res.json()) as (Pick<
    WsDataSourceI,
    'id' | 'name' | 'workspaceId'
  > & {
    dataSource: Pick<GlobalDataSourceI, 'id' | 'name' | 'image' | 'type'>;
  })[];
}

async function one(i: { workspaceId: number; dataSourceId: number }) {
  const res = await fetchX(
    `workspaces/${i.workspaceId}/data-sources/${i.dataSourceId}`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as Pick<
    WsDataSourceI,
    'id' | 'name' | 'workspaceId' | 'config'
  > & {
    dataSource: Pick<GlobalDataSourceI, 'id' | 'name' | 'image' | 'config'>;
  };
}

async function insert({
  workspaceId,
  dto,
  globalDataSourceId,
}: {
  globalDataSourceId: number;
  workspaceId: number;
  dto: DataSourceMeta;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${globalDataSourceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(dto),
    },
  );
  return (await res.json()) as WsDataSourceI;
}

async function deleteOne({
  workspaceId,
  dataSourceId,
}: {
  workspaceId: number;
  dataSourceId: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${dataSourceId}`,
    {
      method: 'DELETE',
    },
  );
  return await res.json();
}

async function update({
  workspaceId,
  dataSourceId,
  dto,
}: {
  workspaceId: number;
  dataSourceId: WsDataSourceI['id'];
  dto: Partial<DataSourceMeta>;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${dataSourceId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(dto),
    },
  );
  return await res.json();
}

function useGlobalDataSources() {
  return useQuery({
    queryKey: [DATASOURCES_QUERY_KEY],
    queryFn: GlobalDataSourceIndex,
  });
}

function useWsDataSources(workspaceId: number) {
  return useQuery({
    queryKey: [DATASOURCES_QUERY_KEY, { workspaceId }],
    queryFn: () => index({ workspaceId }),
    staleTime: 0,
  });
}

function useDataSource(workspaceId: number, dataSourceId: number) {
  return useQuery({
    queryKey: [DATASOURCES_QUERY_KEY, { workspaceId, dataSourceId }],
    queryFn: () => one({ workspaceId, dataSourceId }),
  });
}

function useInsertDatasource(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof insert>>,
    FetchXError,
    Parameters<typeof insert>[0]
  >,
) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: insert,
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: [DATASOURCES_QUERY_KEY],
      });
    },
    ...options,
  });
  return mutate;
}

function useDeleteDatasource(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteOne>>,
    Error,
    Parameters<typeof deleteOne>[0]
  >,
) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: deleteOne,
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: [DATASOURCES_QUERY_KEY],
      });
    },
    ...options,
  });
  return mutate;
}

function useUpdateDataSource(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof update>>,
    Error,
    Parameters<typeof update>[0]
  >,
) {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: update,
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: [DATASOURCES_QUERY_KEY],
      });
    },
    ...options,
  });
  return mutate;
}

export const dataSources = {
  index: { useQuery: useWsDataSources },
  one: { useQuery: useDataSource },
  insert: { useMutation: useInsertDatasource },
  update: { useMutation: useUpdateDataSource },
  delete: { useMutation: useDeleteDatasource },
};

export const globalDataSource = {
  index: { useQuery: useGlobalDataSources },
};
