import { fetchX } from '@/utils/fetch';

export type JsQueryI = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  createdById: number;
  updatedById: number | null;
  appId: number;
  query: string | null;
  settings?: unknown;
};
type InsertI = {
  id: JsQueryI['id'];
  query: JsQueryI['query'];
  settings: JsQueryI['settings'];
};
type UpdateI = Partial<InsertI>;

export async function index({
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

export async function create({
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

export async function update({
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

export async function deleteQuery({
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