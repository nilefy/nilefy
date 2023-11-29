import { Dispatch, SetStateAction, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BookOpenText, Pin, PinOff, Plus, Search } from 'lucide-react';
import { UseMutateFunction, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from './ui/use-toast';
import { api } from '@/api';
import { PageDto } from './pageMenu';
import Page from './page';
export type Page = {
  id: number;
  handle: string;
  name: string;
  enabled: boolean;
  visible: boolean;
  index: number;
  appId: number;
};

export function PageSelector() {
  const { workspaceId, appId } = useParams<{
    workspaceId: string;
    appId: string;
  }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: pages, isLoading } = api.pages.index.useQuery(1, 1);
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [newPageBeingCreated, setNewPageBeingCreated] = useState(false);
  const { mutate: createMutate } = api.pages.create.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pages'] });
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
  const [searchParams, setSearchParams] = useSearchParams();
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ search: e.target.value });
  };
  const [showSearch, setShowSearch] = useState(false);
  useEffect(() => {
    // Update the search parameter in the URL whenever searchParams.search changes
    setSearchParams({ search: searchParams.get('search') || '' });
  }, [searchParams, setSearchParams]);
  const searchParam = searchParams.get('search') || undefined;

  return (
    <Sheet
      key={'left'}
      open={!isPinned ? isOpen : isPinned}
      onOpenChange={setIsOpen}
      modal={false}
    >
      <SheetTrigger>
        <BookOpenText className="h-8 w-8 rotate-0 scale-100 cursor-pointer transition-all" />
      </SheetTrigger>
      <SheetContent side={'left'} className="left-16">
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
                value={searchParams.get('search') || ''}
                onChange={handleSearchChange}
              />
            )}
          </div>
        </SheetHeader>
        <ul className="flex h-full w-full flex-col gap-3 overflow-y-auto">
          {isLoading ? (
            <div>Loading </div>
          ) : (pages || []).length > 0 ? (
            (pages || [])
              .filter((page: PageDto) =>
                searchParam
                  ? page.name.toLowerCase().includes(searchParam.toLowerCase())
                  : true,
              )
              .map((page: PageDto) => (
                <li key={String(page.id)}>
                  <Page
                    page={page}
                    workspaceId={+(workspaceId || 1)}
                    appId={+(appId || 1)}
                  />
                </li>
              ))
          ) : (
            <div>No pages found.</div>
          )}
          {newPageBeingCreated && (
            <div className="w-[100%]">
              <AddingPageHandler
                addNewPage={createMutate}
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
  addNewPage,
  setNewPageBeingCreated,
}: {
  addNewPage: UseMutateFunction<
    PageDto,
    Error,
    {
      workspaceId: number;
      appId: number;
      pageDto: Partial<PageDto>;
    },
    unknown
  >;
  setNewPageBeingCreated: Dispatch<SetStateAction<boolean>>;
}) => {
  const { toast } = useToast();
  const handleAddingNewPage = (pageName: string) => {
    if (pageName.trim().length === 0) {
      toast({
        title: 'Page name should have at least 1 character',
        description: 'Page Name',
      });
    }

    if (pageName && pageName.trim().length > 0) {
      addNewPage({
        workspaceId: 1,
        appId: 1,
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
            console.log(event.target.value);
            handleAddingNewPage(name);
            event.stopPropagation();
          }
        }}
      />
    </div>
  );
};
