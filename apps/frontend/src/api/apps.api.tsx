import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { FetchXError, fetchX } from '@/utils/fetch';
import {
  UndefinedInitialDataOptions,
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { z } from 'zod';

export type WebloomTree = Record<
  string,
  InstanceType<typeof WebloomWidget>['snapshot']
>;

export const APPS_QUERY_KEY = 'apps';
export type AppI = {
  id: number;
  name: string;
  deletedAt: string | null;
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
  index: number;
};

type UserMetaI = { id: number; username: string };

export const appMetaSchema = z.object({
  name: z.string().min(4).max(255),
  description: z.string().min(4).max(255).optional(),
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
  })[];
}

export type AppCompleteT = AppI & {
  pages: PageI[];
  defaultPage: PageI & { tree: WebloomTree };
};

async function one({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: number;
}) {
  const res = await fetchX(`workspaces/${workspaceId}/apps/${appId}`, {
    method: 'GET',
  });
  return (await res.json()) as AppCompleteT;
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

export const useAppQuery = ({
  workspaceId,
  appId,
  onSuccess,
}: {
  workspaceId: number;
  appId: number;
  onSuccess?: (data: AppCompleteT) => void;
}): UndefinedInitialDataOptions<AppCompleteT, Error, AppCompleteT> => ({
  queryKey: [APPS_QUERY_KEY, { workspaceId, appId }, onSuccess],
  queryFn: async () => {
    const data = await one({ workspaceId, appId });
    if (onSuccess) {
      onSuccess(data);
    }
    return data;
  },
  staleTime: 0,
});

function useApp(...rest: Parameters<typeof useAppQuery>) {
  const app = useQuery(useAppQuery(...rest));
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
};
