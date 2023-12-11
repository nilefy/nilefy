import { z } from 'zod';
import { User } from './users.api';
import { fetchX } from '@/utils/fetch';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

const GROUPS_QUERY_KEY = 'groups';

export type Group = {
  id: number;
  name: string;
  users: User[];
  description: string | null;
  permissions: string[];
};

export const groupMetaSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
});

export type GroupMetaSchema = z.infer<typeof groupMetaSchema>;

async function index(i: { workspaceId: number }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles`, {
    method: 'GET',
  });
  return (await res.json()) as Omit<Group, 'users' | 'permissions'>[];
}

async function one(i: { workspaceId: number; roleId: number }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.roleId}`, {
    method: 'GET',
  });
  return (await res.json()) as Group;
}

async function insert(i: { workspaceId: number; dto: GroupMetaSchema }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(i.dto),
  });
  return (await res.json()) as GroupMetaSchema & { id: number };
}

async function update(i: {
  workspaceId: number;
  groupId: Group['id'];
  dto: GroupMetaSchema;
}) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.groupId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(i.dto),
  });
  return (await res.json()) as GroupMetaSchema & { id: number };
}

function useGroups(workspaceId: number) {
  return useQuery({
    queryKey: [GROUPS_QUERY_KEY, { workspaceId }],
    queryFn: () => index({ workspaceId }),
    staleTime: 0,
  });
}

function useGroup(workspaceId: number, roleId: number) {
  return useQuery({
    queryKey: ['groups', { workspaceId, roleId }],
    queryFn: () => one({ workspaceId, roleId }),
  });
}

function useInsertGroup(
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

function useUpdateGroup(
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

export const groups = {
  index: { useQuery: useGroups },
  one: { useQuery: useGroup },
  insert: { useMutation: useInsertGroup },
  update: { useMutation: useUpdateGroup },
};
