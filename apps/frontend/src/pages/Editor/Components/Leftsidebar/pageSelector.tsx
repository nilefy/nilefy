import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import { Plus, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { useToast } from '../../../../components/ui/use-toast';
import { api } from '@/api';
import Page from './page';
// import { SortableList } from './sortableList';
import { PAGES_QUERY_KEY, PageDto } from '@/api/pages.api';
import { matchSorter } from 'match-sorter';
import { WebloomLoader } from '@/components/loader';

export function PageSelector() {
  const { workspaceId, appId } = useParams<{
    workspaceId: string;
    appId: string;
  }>();
  const {
    data: pages,
    isPending,
    isError,
    error,
  } = api.pages.index.useQuery(+(workspaceId as string), +(appId as string));
  const [newPageBeingCreated, setNewPageBeingCreated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const [showSearch, setShowSearch] = useState(false);
  const filteredPages = useMemo<PageDto[]>(() => {
    if (!pages) return [];
    return matchSorter(pages, searchQuery, {
      keys: ['name'],
    });
  }, [pages, searchQuery]);

  if (isError) {
    throw error;
  } else if (isPending) {
    return <WebloomLoader />;
  }

  return (
    <div className="h-full w-full">
      <div className="flex flex-row justify-end">
        <Button
          title={'Add Page'}
          onClick={() => setNewPageBeingCreated(true)}
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          title={'Search'}
          onClick={() => setShowSearch(!showSearch)}
          variant="ghost"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div>
        {showSearch && (
          <Input
            type="search"
            className="mb-2 w-full self-center"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        )}
      </div>
      <ul className="flex h-full w-full flex-col gap-3 overflow-y-auto">
        {/* <SortableList
            items={filteredPages}
            onSortEnd={(p1, p2) => {
              //TODO: make sure the setSortedPages is done correctly
              const page1 = pages.find((item) => item.index === p1.index);
              const page2 = pages.find((item) => item.index === p2.index);
              if (!page1 || !page2) throw new Error('bitch where is my money');
              updateMutate({
                workspaceId: +(workspaceId as string),
                appId: +(appId as string),
                pageId: page1.id,
                pageDto: {
                  index: page2.index,
                },
              });
              //   updateMutate({
              //     workspaceId: 1,
              //     appId: 1,
              //     pageId: page2.id,
              //     pageDto: {
              //       index: page1.index,
              //     },
              //   });
              queryClient.invalidateQueries({
                queryKey: [PAGES_QUERY_KEY, { workspaceId, appId }],
              });
            }}
            renderItem={(item) => (
              <Page
                key={item.id}
                workspaceId={+(workspaceId as string)}
                appId={+(appId as string)}
                page={item}
              />
            )}
          /> */}
        {filteredPages.map((item) => (
          <Page
            key={item.id}
            workspaceId={+(workspaceId as string)}
            appId={+(appId as string)}
            page={item}
          />
        ))}

        {newPageBeingCreated && (
          <div className="w-[100%]">
            <AddingPageHandler
              setNewPageBeingCreated={setNewPageBeingCreated}
            />
          </div>
        )}
      </ul>
    </div>
  );
}

export const AddingPageHandler = ({
  setNewPageBeingCreated,
}: {
  setNewPageBeingCreated: Dispatch<SetStateAction<boolean>>;
}) => {
  const queryClient = useQueryClient();
  const { mutate: createMutate } = api.pages.create.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
      toast({
        title: 'Page Added Successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Failed To Add Page',
        variant: 'destructive',
      });
    },
  });
  const { workspaceId, appId } = useParams();
  const { toast } = useToast();
  const handleAddingNewPage = (pageName: string) => {
    if (pageName.trim().length === 0) {
      toast({
        title: 'Page name should have at least 1 character',
        description: 'Page Name',
      });
    }

    if (pageName && pageName.trim().length > 0) {
      createMutate({
        workspaceId: +(workspaceId as string),
        appId: +(appId as string),
        pageDto: {
          name: pageName,
          handle: pageName.toLowerCase(),
        },
      });
    }
    setNewPageBeingCreated(false);
  };

  return (
    <div className="mt-2 w-[100%]">
      <Input
        type="text"
        autoFocus
        placeholder="Enter new page name"
        onBlur={(event) => {
          const name = event.target.value;
          handleAddingNewPage(name);
          event.stopPropagation();
        }}
        onKeyDown={(
          event: React.KeyboardEvent<HTMLInputElement> &
            React.ChangeEvent<HTMLInputElement>,
        ) => {
          if (event.key === 'Enter') {
            const name = event.target.value;
            handleAddingNewPage(name);
            event.stopPropagation();
          }
        }}
      />
    </div>
  );
};
