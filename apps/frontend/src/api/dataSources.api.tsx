import { FetchXError, fetchX } from '@/utils/fetch';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import {
  UndefinedInitialDataOptions,
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import z from 'zod';

export const DATASOURCES_QUERY_KEY = 'datasources';

const environments = z
  .union([
    z.literal('development'),
    z.literal('staging'),
    z.literal('production'),
  ])
  .default('development');
type envT = z.infer<typeof environments>;

export const dataSourceMeta = z.object({
  name: z.string().min(1).max(100),
  config: z.record(z.string(), z.unknown()),
  env: environments,
});

export type DataSourceMeta = z.infer<typeof dataSourceMeta>;

export type PluginConfigT = {
  schema: RJSFSchema;
  uiSchema?: UiSchema;
};

export type DataSourceTestConnectionRet = {
  /**
   * connection state
   */
  connected: boolean;
  /**
   * if the plugin wants to return message with the connection test result
   */
  msg?: string;
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
  config: Record<envT, Record<string, unknown>>;
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

async function index({
  workspaceId,
  env = 'any',
}: {
  workspaceId: number;
  env: 'development' | 'staging' | 'production' | 'any';
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/env/${env}`,
    {
      method: 'GET',
    },
  );
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

async function testDsConnection({
  workspaceId,
  dataSourceId,
  dto,
}: {
  workspaceId: number;
  dataSourceId: WsDataSourceI['id'];
  dto: {
    config: DataSourceMeta['config'];
  };
}): Promise<DataSourceTestConnectionRet> {
  const res = await fetchX(
    `workspaces/${workspaceId}/data-sources/${dataSourceId}/testConnection`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(dto),
    },
  );
  return await res.json();
}

export type GlobalDataSourceIndexRet = Awaited<
  ReturnType<typeof GlobalDataSourceIndex>
>;

export function globalDataSourcesQuery(): UndefinedInitialDataOptions<
  GlobalDataSourceIndexRet,
  FetchXError,
  GlobalDataSourceIndexRet
> {
  return {
    queryKey: [DATASOURCES_QUERY_KEY],
    queryFn: GlobalDataSourceIndex,
  };
}

function useGlobalDataSources() {
  return useQuery(globalDataSourcesQuery());
}

type WsDataSourcesIndexRet = Awaited<ReturnType<typeof index>>;

export function wsDataSourcesQuery({
  workspaceId,
  env,
}: {
  workspaceId: WsDataSourceI['workspaceId'];
  env?: 'development' | 'staging' | 'production';
}): UndefinedInitialDataOptions<
  WsDataSourcesIndexRet,
  FetchXError,
  WsDataSourcesIndexRet
> {
  return {
    queryKey: [DATASOURCES_QUERY_KEY, { workspaceId, env }],
    queryFn: async () => index({ workspaceId, env }),
    staleTime: 0,
  };
}

function useWsDataSources(...rest: Parameters<typeof wsDataSourcesQuery>) {
  return useQuery(wsDataSourcesQuery(...rest));
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

function useTestDatasourceConnection(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof testDsConnection>>,
    FetchXError,
    Parameters<typeof testDsConnection>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: testDsConnection,
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
    async onSuccess(data, variables) {
      // Access parameters here
      const workspaceId = variables.workspaceId;
      const dataSourceId = variables.dataSourceId;
      const dto = variables.dto;
      await queryClient.invalidateQueries({
        queryKey: [DATASOURCES_QUERY_KEY],
      });
      if (dto.config && dto.config.scope.includes('Google Sheets')) {
        window.location.href = `/api/auth/googlesheets/${+workspaceId}/${+dataSourceId}`;
      }
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
  testConnection: { useMutation: useTestDatasourceConnection },
};

export const globalDataSource = {
  index: { useQuery: useGlobalDataSources },
};
