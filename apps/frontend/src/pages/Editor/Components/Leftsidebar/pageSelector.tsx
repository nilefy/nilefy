import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BookOpenText, Pin, PinOff, Plus, Search } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { useToast } from '../../../../components/ui/use-toast';
import { api } from '@/api';
import Page from '../../../../components/page';
// import { SortableList } from './sortableList';
import { PAGES_QUERY_KEY, PageDto } from '@/api/pages.api';
import { matchSorter } from 'match-sorter';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
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
  const queryClient = useQueryClient();

  const { mutate: updateMutate } = api.pages.update.useMutation({
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: [PAGES_QUERY_KEY] });
    },
  });

  if (isError) {
    throw error;
  } else if (isPending) {
    return <>loading</>;
  }

  return (
    <Sheet
      key={'left'}
      open={!isPinned ? isOpen : isPinned}
      onOpenChange={(open) => {
        if (!open || isPinned) {
          setSearchQuery('');
        }
        setIsOpen(open);
      }}
      modal={false}
    >
      <SheetTrigger className="flex items-center justify-center" title="Pages">
        <BookOpenText className="h-8 w-8 rotate-0 scale-100 cursor-pointer transition-all" />
      </SheetTrigger>
      <SheetContent side={'left'} className="left-14">
        <SheetHeader>
          <SheetTitle>Pages</SheetTitle>
          <div className="flex flex-row justify-end ">
            <Button
              title={'Add Page'}
              onClick={() => setNewPageBeingCreated(true)}
              variant="ghost"
            >
              <Plus />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(true);
                setIsPinned(!isPinned);
              }}
            >
              {isPinned ? <PinOff /> : <Pin />}
            </Button>
            <Button
              title={'Search'}
              onClick={() => setShowSearch(!showSearch)}
              variant="ghost"
            >
              <Search />
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
        </SheetHeader>
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
      </SheetContent>
    </Sheet>
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
