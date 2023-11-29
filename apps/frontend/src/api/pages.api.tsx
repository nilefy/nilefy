import { useToast } from '@/components/ui/use-toast';
import { fetchX } from '@/utils/fetch';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

export interface PageDto {
  id: number;
  handle: string;
  name: string;
  enabled: boolean;
  visible: boolean;
  index: number;
  appId: number;
}
async function fetchPages({
  workspaceId,
  appId,
}: {
  workspaceId: number;
  appId: number;
}) {
  const response = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/pages`,
  );
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
function useFetchPages(workspaceId: number, appId: number) {
  const pages = useQuery({
    queryKey: ['pages', workspaceId, appId],
    queryFn: async () => await fetchPages({ workspaceId, appId }),
    staleTime: 0,
  });
  return pages;
}

const fetchPage = async (appId: number, pageId: number) => {
  const response = await fetchX(
    `workspaces/:workspaceId/apps/${appId}/pages/${pageId}`,
  );
  const data = await response.json();
  return data;
};
async function createPage({
  workspaceId,
  appId,
  pageDto,
}: {
  workspaceId: number;
  appId: number;
  pageDto: Partial<PageDto>;
}) {
  console.log(pageDto);

  const response = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/pages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageDto),
    },
  );
  const data = await response.json();
  return data;
}
function useCreatePage(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof createPage>>,
    Error,
    Parameters<typeof createPage>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: createPage,
    ...options,
  });
  return mutate;
}

async function clonePage({
  workspaceId,
  appId,
  pageId,
}: {
  workspaceId: number;
  appId: number;
  pageId: number;
}) {
  const response = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/pages/${pageId}/clone`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  const data = await response.json();
  console.log('cloning front');

  return data;
}
function useClonePage(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof clonePage>>,
    Error,
    Parameters<typeof clonePage>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: clonePage,
    ...options,
  });
  return mutate;
}
const updatePage = async ({
  workspaceId,
  appId,
  pageId,
  pageDto,
}: {
  workspaceId: number;
  appId: number;
  pageId: PageDto['id'];
  pageDto: Partial<PageDto>;
}) => {
  const response = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/pages/${pageId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageDto),
    },
  );
  const data = await response.json();
  return data;
};

function useUpdatePage(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updatePage>>,
    Error,
    Parameters<typeof updatePage>[0]
  >,
) {
  const { toast } = useToast();
  const mutate = useMutation({
    mutationFn: updatePage,
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed To Update Page ',
      });
      console.log(error);
    },
    ...options,
  });
  return mutate;
}
async function deletePage({
  workspaceId,
  appId,
  pageId,
}: {
  workspaceId: number;
  appId: number;
  pageId: number;
}) {
  const response = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/pages/${pageId}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  const data = await response.json();
  return data;
}
function useDeletePage(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof deletePage>>,
    Error,
    Parameters<typeof deletePage>[0]
  >,
) {
  const mutate = useMutation({
    mutationFn: deletePage,
    ...options,
  });
  return mutate;
}
export const pages = {
  index: { useQuery: useFetchPages },
  one: { useQuery: fetchPage },
  create: { useMutation: useCreatePage },
  clone: { useMutation: useClonePage },
  update: { useMutation: useUpdatePage },
  delete: { useMutation: useDeletePage },
};
