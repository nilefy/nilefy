import { fetchX } from '@/utils/fetch';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

const DATASOURCES_QUERY_KEY = 'datasources';

export type GlobalDataSourceI = {
  id: number;
  name: string;
  description: string | null;
  type: 'database' | 'api' | 'cloud storage' | 'plugin';
  image: string | null;
  config: Record<string, unknown>;
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
  return (await res.json()) as WsDataSourceI[];
}

// async function one(i: { workspaceId: number; dataSourceId: number }) {
//   const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.roleId}`, {
//     method: 'GET',
//   });
//   return (await res.json()) as Group;
// }

// async function insert(i: { workspaceId: number; dto: GroupMetaSchema }) {
//   const res = await fetchX(`workspaces/${i.workspaceId}/roles`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json;charset=utf-8',
//     },
//     body: JSON.stringify(i.dto),
//   });
//   return (await res.json()) as GroupMetaSchema & { id: number };
// }

// async function update(i: {
//   workspaceId: number;
//   groupId: Group['id'];
//   dto: GroupMetaSchema;
// }) {
//   const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.groupId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json;charset=utf-8',
//     },
//     body: JSON.stringify(i.dto),
//   });
//   return (await res.json()) as GroupMetaSchema & { id: number };
// }

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

// function useGroup(workspaceId: number, roleId: number) {
//   return useQuery({
//     queryKey: ['groups', { workspaceId, roleId }],
//     queryFn: () => one({ workspaceId, roleId }),
//   });
// }

// function useInsertGroup(
//   options?: UseMutationOptions<
//     Awaited<ReturnType<typeof insert>>,
//     Error,
//     Parameters<typeof insert>[0]
//   >,
// ) {
//   const mutate = useMutation({
//     mutationFn: insert,
//     ...options,
//   });
//   return mutate;
// }

// function useUpdateGroup(
//   options?: UseMutationOptions<
//     Awaited<ReturnType<typeof update>>,
//     Error,
//     Parameters<typeof update>[0]
//   >,
// ) {
//   const mutate = useMutation({
//     mutationFn: update,
//     ...options,
//   });
//   return mutate;
// }

export const dataSources = {
  index: { useQuery: useWsDataSources },
  //   one: { useQuery: useGroup },
  //   insert: { useMutation: useInsertGroup },
  //   update: { useMutation: useUpdateGroup },
};

export const globalDataSource = {
  index: { useQuery: useGlobalDataSources },
};
