import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';
import { EntityFormContext, EntityFormControlContext } from '..';
import { useContext } from 'react';
import { XCircleIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const ErrorPopover = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { focusedPath } = useContext(EntityFormContext);
    const { entityId, path } = useContext(EntityFormControlContext);
    const errors = editorStore.getEntityById(entityId)!.errors[path];
    const popOverOpen = focusedPath === path && !!errors;
    return (
      <Popover open={popOverOpen} defaultOpen={false}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          asChild
        >
          <div className="bg-red-100">
            <header className="flex items-center justify-between p-2">
              <h2 className="flex items-center justify-between gap-2 text-red-800">
                <XCircleIcon className=" text-red-800" />
                <span>Error</span>
              </h2>
            </header>
            <Separator className="h-[1px] bg-gray-400" />
            <ScrollArea>
              <div className="p-2 text-sm text-gray-600">
                <ul>
                  {errors?.validationErrors?.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                  {errors?.evaluationErrors?.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
