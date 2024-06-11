import { FetchXError, fetchX } from '@/utils/fetch';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';
import { z } from 'zod';
import { User } from './users.api';

export type Workspace = { id: number; name: string; imageUrl: string | null };
export type WorkSpaces = Workspace[];

export const workspaceSchema = z.object({
  name: z.string().min(3).max(255),
});
export type WorkspaceSchema = z.infer<typeof workspaceSchema>;

export const WORKSPACES_QUERY_KEY = 'workspaces';

async function insert(data: WorkspaceSchema) {
  const res = await fetchX('/workspaces', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return (await res.json()) as Workspace;
}

async function workspaceUsers({
  workspaceId,
}: {
  workspaceId: Workspace['id'];
}) {
  // TODO: add pagination options
  const res = await fetchX(`/workspaces/${workspaceId}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return (await res.json()) as User[];
}

async function update(data: {
  id: Workspace['id'];
  workspace: WorkspaceSchema;
}) {
  const res = await fetchX(`/workspaces/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data.workspace),
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return (await res.json()) as Workspace;
}

export const indexQueryConfig = () => ({
  queryKey: [WORKSPACES_QUERY_KEY],
  queryFn: async () => {
    const res = await fetchX('workspaces');
    return (await res.json()) as WorkSpaces;
  },
  staleTime: Infinity,
});

function useWorkspaces(...rest: Parameters<typeof indexQueryConfig>) {
  return useQuery(indexQueryConfig(...rest));
}

function useWorkspaceUsers(workspaceId: number) {
  return useQuery({
    queryKey: [WORKSPACES_QUERY_KEY, { workspaceId }, 'users'],
    queryFn: () => workspaceUsers({ workspaceId }),
  });
}

function useInsertWorkspace(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof insert>>,
    FetchXError,
    Parameters<typeof insert>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: insert,
    ...options,
  });
  return mutate;
}

function useUpdateWorkspace(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof update>>,
    FetchXError,
    Parameters<typeof update>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: update,
    ...options,
  });
  return mutate;
}

export const workspaces = {
  index: { useQuery: useWorkspaces },
  insert: { useMutation: useInsertWorkspace },
  update: { useMutation: useUpdateWorkspace },
  users: { useQuery: useWorkspaceUsers },
};
