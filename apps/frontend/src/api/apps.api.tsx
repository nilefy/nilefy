import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { FetchXError, fetchX } from '@/utils/fetch';
import {
  UndefinedInitialDataOptions,
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { z } from 'zod';
import { PageDto } from './pages.api';

export const APPS_QUERY_KEY = 'apps';
export type AppI = {
  id: number;
  name: string;
  env: 'development' | 'staging' | 'production';
  createdAt: string;
  updatedAt: string | null;
  createdById: number;
  description: string | null;
  updatedById: number | null;
  deletedById: number | null;
  workspaceId: number;
};
export type PageI = {
  id: number;
  name: string;
  handle: string;
};

type UserMetaI = { id: number; username: string };

export const appMetaSchema = z.object({
  name: z.string().min(4).max(255),
  description: z.string().min(4).max(255).optional(),
  env: z
    .union([
      z.literal('development'),
      z.literal('staging'),
      z.literal('production'),
    ])
    .default('development'),
});
export type AppMetaT = z.infer<typeof appMetaSchema>;

async function insert({
  workspaceId,
  data,
}: {
  workspaceId: number;
  data: AppMetaT;
}) {
  const res = await fetchX(`workspaces/${workspaceId}/apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  return (await res.json()) as AppI;
}

async function update({
  workspaceId,
  appId,
  data,
}: {
  workspaceId: number;
  data: Partial<AppMetaT>;
  appId: AppI['id'];
}) {
  const res = await fetchX(`workspaces/${workspaceId}/apps/${appId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(data),
  });
  return (await res.json()) as AppI;
}

async function clone({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: AppI['id'];
}) {
  const res = await fetchX(`workspaces/${workspaceId}/apps/${appId}/clone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return (await res.json()) as AppI;
}

async function deleteOne({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: AppI['id'];
}) {
  const res = await fetchX(`workspaces/${workspaceId}/apps/${appId}`, {
    method: 'DELETE',
  });
  return (await res.json()) as AppI;
}

async function index({ workspaceId }: { workspaceId: number }) {
  const res = await fetchX(`workspaces/${workspaceId}/apps`, {
    method: 'GET',
  });
  return (await res.json()) as (AppI & {
    updatedBy: UserMetaI | null;
    createdBy: UserMetaI;
    page: Pick<PageDto, 'id' | 'name'>;
  })[];
}
type WebloomTree = Record<
  string,
  InstanceType<typeof WebloomWidget>['snapshot']
>;

export type AppCompleteT = AppI & {
  pages: PageI[];
  defaultPage: PageI & { tree: WebloomTree };
  onBoardingCompleted: boolean;
};

async function one({
  workspaceId,
  appId,
  pageId,
}: {
  workspaceId: number;
  appId: number;
  /**
   * as optional field front can provide page id and the back will load instead of the default page
   */
  pageId?: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}${
      pageId ? '?pageId=' + pageId : ''
    }`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as AppCompleteT;
}

export async function exportApp({
  workspaceId,
  appId,
  appName,
}: {
  workspaceId: number;
  appId: number;
  appName: string;
}) {
  const blob = await (
    await fetchX(`workspaces/${workspaceId}/apps/export/${appId}`, {
      method: 'GET',
    })
  ).blob();
  // Create blob link to download
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${appName}.json`);

  // Append to html link element page
  document.body.appendChild(link);

  // Start download
  link.click();
  // Clean up and remove the link
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

export async function importApp({
  workspaceId,
  formData,
}: {
  workspaceId: number;
  formData: FormData;
}) {
  await fetchX(`workspaces/${workspaceId}/apps/import`, {
    method: 'POST',
    // headers: { 'content-type': 'multipart/form-data' },
    body: formData,
  });
}

export type AppsIndexRet = Awaited<ReturnType<typeof index>>;
/**
 * query config to get workspace apps
 */
export const useAppsQuery = ({
  workspaceId,
}: {
  workspaceId: number;
}): UndefinedInitialDataOptions<AppsIndexRet, FetchXError, AppsIndexRet> => ({
  queryKey: [APPS_QUERY_KEY, { workspaceId }],
  queryFn: async () => {
    return await index({ workspaceId });
  },
  staleTime: 0,
});
function useApps(...rest: Parameters<typeof useAppsQuery>) {
  return useQuery(useAppsQuery(...rest));
}

// TODO: change function name because it's currently misleading
export const fetchAppData = ({
  workspaceId,
  appId,
  pageId,
}: {
  workspaceId: number;
  appId: number;
  /**
   * as optional field front can provide page id and the back will load instead of the default page
   */
  pageId?: number;
}): UndefinedInitialDataOptions<AppCompleteT, Error, AppCompleteT> => ({
  // i don't want to add page id to the query key disable this error
  queryKey: [APPS_QUERY_KEY, { workspaceId, appId, pageId }],
  queryFn: async () => {
    const data = await one({ workspaceId, appId, pageId });
    return data;
  },
  staleTime: 0,
});

function useApp(...rest: Parameters<typeof fetchAppData>) {
  const app = useQuery(fetchAppData(...rest));
  return app;
}

function useInsertApp(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof insert>>,
    Error,
    Parameters<typeof insert>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: insert,
    ...options,
  });
  return mutate;
}

function useImportApp(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof importApp>>,
    Error,
    Parameters<typeof importApp>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: importApp,
    ...options,
  });
  return mutate;
}

function useUpdateApp(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof update>>,
    Error,
    Parameters<typeof update>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: update,
    ...options,
  });
  return mutate;
}

function useDeleteApp(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof deleteOne>>,
    Error,
    Parameters<typeof deleteOne>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: deleteOne,
    ...options,
  });
  return mutate;
}

function useCloneApp(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof clone>>,
    Error,
    Parameters<typeof clone>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: clone,
    ...options,
  });
  return mutate;
}

export const apps = {
  index: { useQuery: useApps },
  one: { useQuery: useApp },
  insert: { useMutation: useInsertApp },
  delete: { useMutation: useDeleteApp },
  update: { useMutation: useUpdateApp },
  clone: { useMutation: useCloneApp },
  import: { useMutation: useImportApp },
};
