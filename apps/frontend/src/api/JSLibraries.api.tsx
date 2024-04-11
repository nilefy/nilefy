import { fetchX } from '@/utils/fetch';
import { UndefinedInitialDataOptions } from '@tanstack/react-query';

export type JSLibraryI = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  createdById: number;
  updatedById: number | null;
  appId: number;
  url: string;
};
type InsertI = {
  id: JSLibraryI['id'];
  url: JSLibraryI['url'];
};
type UpdateI = Partial<InsertI>;

export async function indexJSLibraries({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/jsLibraries`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as JSLibraryI[];
}
const JS_QUERY_KEY = 'jsLibraries';
export const useJSLibraries = ({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: number;
}): UndefinedInitialDataOptions<JSLibraryI[], Error, JSLibraryI[]> => ({
  queryKey: [JS_QUERY_KEY, { workspaceId, appId }],
  queryFn: async () => {
    const data = await indexJSLibraries({ workspaceId, appId });
    return data;
  },
  staleTime: 0,
});

export async function createJSLibrary({
  workspaceId,
  appId,
  dto,
}: {
  workspaceId: number;
  appId: number;
  dto: InsertI;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/jsLibraries/add`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    },
  );
  return (await res.json()) as JSLibraryI;
}

export async function updateJSLibrary({
  workspaceId,
  appId,
  libraryId,
  dto,
}: {
  workspaceId: number;
  appId: JSLibraryI['appId'];
  libraryId: JSLibraryI['id'];
  dto: UpdateI;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/jsLibraries/${libraryId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    },
  );
  return (await res.json()) as JSLibraryI;
}

export async function deleteJSLibrary({
  workspaceId,
  appId,
  libraryId,
}: {
  workspaceId: number;
  appId: JSLibraryI['appId'];
  libraryId: JSLibraryI['id'];
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/jsLibraries/${libraryId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return (await res.json()) as {
    id: string;
  };
}
