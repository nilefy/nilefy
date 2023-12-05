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

export async function getDataSources({
  workspaceId,
}: {
  workspaceId: string | undefined;
}) {
  const res = await fetchX(`workspaces/${workspaceId}/data-sources`, {
    method: 'GET',
  });
  return (await res.json()) as dataSource;
}

export async function getGlobalDataSources() {
  const res = await fetchX(`data-sources/global`, {
    method: 'GET',
  });
  return (await res.json()) as dataSource;
}
