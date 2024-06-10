import { useToast } from '@/components/ui/use-toast';
import { FetchXError, fetchX } from '@/utils/fetch';
import {
  UndefinedInitialDataOptions,
  UseMutationOptions,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

export const PAGES_QUERY_KEY = 'pages';

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
  const data = await response.json();
  return data as PageDto[];
}

function useFetchPages(workspaceId: number, appId: number) {
  const pages = useQuery({
    queryKey: [PAGES_QUERY_KEY, { workspaceId, appId }],
    queryFn: async () => await fetchPages({ workspaceId, appId }),
    staleTime: 0,
  });
  return pages;
}

const fetchPage = async ({
  workspaceId,
  appId,
  pageId,
}: {
  workspaceId: number;
  appId: number;
  pageId: number;
}) => {
  const response = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/pages/${pageId}`,
  );
  const data = await response.json();
  return data as PageDto;
};

// TODO: change function name because it's currently misleading
export const usePageQuery = ({
  workspaceId,
  appId,
  pageId,
}: {
  workspaceId: number;
  appId: number;
  pageId: number;
}): UndefinedInitialDataOptions<
  ReturnType<typeof fetchPage>,
  Error,
  ReturnType<typeof fetchPage>
> => ({
  queryKey: [PAGES_QUERY_KEY, { workspaceId, appId, pageId }],
  queryFn: async () => {
    const data = await fetchPage({ workspaceId, appId, pageId });
    return data;
  },
  staleTime: 0,
});

function useFetchPage(workspaceId: number, appId: number, pageId: number) {
  return useQuery({
    queryKey: [PAGES_QUERY_KEY, { workspaceId, appId, pageId }],
    queryFn: async () => await fetchPage({ workspaceId, appId, pageId }),
    staleTime: 0,
  });
}

async function createPage({
  workspaceId,
  appId,
  pageDto,
}: {
  workspaceId: number;
  appId: number;
  pageDto: Partial<PageDto>;
}) {
  const response = await fetchX(
    `workspaces/${workspaceId}/apps/${appId}/pages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageDto),
    },
  );
  const data = await response.json();
  return data as PageDto;
}

function useCreatePage(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof createPage>>,
    FetchXError,
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

  return data as PageDto;
}

function useClonePage(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof clonePage>>,
    FetchXError,
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
  return data as PageDto;
};

function useUpdatePage(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof updatePage>>,
    FetchXError,
    Parameters<typeof updatePage>[0]
  >,
) {
  const { toast } = useToast();
  const mutate = useMutation({
    mutationFn: updatePage,
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Failed To Update Page ',
      });
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
    FetchXError,
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
  one: { useQuery: useFetchPage },
  create: { useMutation: useCreatePage },
  clone: { useMutation: useClonePage },
  update: { useMutation: useUpdatePage },
  delete: { useMutation: useDeletePage },
};
