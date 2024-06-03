import { fetchX } from '@/utils/fetch';
import { UndefinedInitialDataOptions } from '@tanstack/react-query';

export type JsQueryI = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  createdById: number;
  updatedById: number | null;
  appId: number;
  query: string | null;
  settings?: unknown;
  triggerMode: 'manually' | 'onAppLoad';
};
type InsertI = {
  id: JsQueryI['id'];
  query: JsQueryI['query'];
  settings: JsQueryI['settings'];
  /**
   * default value is "manually"
   */
  triggerMode?: JsQueryI['triggerMode'];
};
type UpdateI = Partial<InsertI>;

export async function indexJSqueries({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: number;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/jsQueries`,
    {
      method: 'GET',
    },
  );
  return (await res.json()) as JsQueryI[];
}
const JS_QUERY_KEY = 'jsQueries';
export const useJSQueries = ({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: number;
}): UndefinedInitialDataOptions<JsQueryI[], Error, JsQueryI[]> => ({
  queryKey: [JS_QUERY_KEY, { workspaceId, appId }],
  queryFn: async () => {
    const data = await indexJSqueries({ workspaceId, appId });
    return data;
  },
  staleTime: 0,
});

export async function createJSquery({
  workspaceId,
  appId,
  dto,
}: {
  workspaceId: number;
  appId: number;
  dto: InsertI;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/jsQueries/add`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    },
  );
  return (await res.json()) as JsQueryI;
}

export async function updateJSquery({
  workspaceId,
  appId,
  queryId,
  dto,
}: {
  workspaceId: number;
  appId: JsQueryI['appId'];
  queryId: JsQueryI['id'];
  dto: UpdateI;
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/jsQueries/${queryId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    },
  );
  return (await res.json()) as JsQueryI;
}

export async function deleteJSQuery({
  workspaceId,
  appId,
  queryId,
}: {
  workspaceId: number;
  appId: JsQueryI['appId'];
  queryId: JsQueryI['id'];
}) {
  const res = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/jsQueries/${queryId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return (await res.json()) as {
    id: string;
  };
}
