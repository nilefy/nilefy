import { PermissionsTypes } from '@nilefy/permissions';
import { z } from 'zod';
import { User } from './users.api';
import { fetchX } from '@/utils/fetch';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

export const ROLES_QUERY_KEY = 'roles';
const PERMISSIONS_QUERY_KEY = 'workspaceUsers';

export type Role = {
  id: number;
  name: string;
  users: User[];
  description: string | null;
  permissions: PermissionI[];
};

export const roleMetaSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
});

export type RoleMetaSchema = z.infer<typeof roleMetaSchema>;

async function index(i: { workspaceId: number }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles`, {
    method: 'GET',
  });
  return (await res.json()) as Omit<Role, 'users' | 'permissions'>[];
}

async function one(i: { workspaceId: number; roleId: number }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.roleId}`, {
    method: 'GET',
  });
  return (await res.json()) as Role;
}

async function insert(i: { workspaceId: number; dto: RoleMetaSchema }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(i.dto),
  });
  return (await res.json()) as RoleMetaSchema & { id: number };
}

async function update(i: {
  workspaceId: number;
  roleId: Role['id'];
  dto: RoleMetaSchema;
}) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.roleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(i.dto),
  });
  return (await res.json()) as RoleMetaSchema & { id: number };
}

async function deleteOne(i: { workspaceId: number; roleId: Role['id'] }) {
  const res = await fetchX(`workspaces/${i.workspaceId}/roles/${i.roleId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  return (await res.json()) as undefined;
}

function useRoles(workspaceId: number) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, { workspaceId }],
    queryFn: () => index({ workspaceId }),
    staleTime: 0,
  });
}

function useRole(workspaceId: number, roleId: number) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, { workspaceId, roleId }],
    queryFn: () => one({ workspaceId, roleId }),
    staleTime: 0,
  });
}

function useInsertRole(
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

function useUpdateRole(
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

function useDeleteOne(
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

export type PermissionI = {
  id: number;
  name: PermissionsTypes;
};

async function getAllPermissions() {
  const res = await fetchX('permissions', {
    method: 'GET',
  });
  return (await res.json()) as PermissionI[];
}

async function togglePermission({
  workspaceId,
  roleId,
  permissionId,
}: {
  workspaceId: number;
  roleId: number;
  permissionId: PermissionI['id'];
}) {
  await fetchX(
    `workspaces/${workspaceId}/roles/${roleId}/togglepermission/${permissionId}`,
    {
      method: 'PUT',
    },
  );
}

function useTogglePermission() {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: togglePermission,
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: [ROLES_QUERY_KEY],
      });
    },
  });
  return mutate;
}

function usePermissions() {
  const permissions = useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY],
    queryFn: getAllPermissions,
    staleTime: Infinity,
  });
  return permissions;
}

export const permissions = {
  index: { useQuery: usePermissions },
  toggle: { useMutation: useTogglePermission },
};
export const roles = {
  index: { useQuery: useRoles },
  one: { useQuery: useRole },
  insert: { useMutation: useInsertRole },
  update: { useMutation: useUpdateRole },
  delete: { useMutation: useDeleteOne },
};
