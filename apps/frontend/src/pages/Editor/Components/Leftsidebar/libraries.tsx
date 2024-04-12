import { WebloomLoader } from '@/components/loader';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { editorStore } from '@/lib/Editor/Models';
import { AccordionContent } from '@radix-ui/react-accordion';
import { entries } from 'lodash';
import { CloudDownload, Trash } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';
import { z } from 'zod';
const UrlSchema = z.string().url();
export const Libraries = observer(() => {
  const toast = useToast();
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const validation = UrlSchema.safeParse(url);
  const handleInstallLibrary = useCallback(
    async (url: string) => {
      try {
        setIsLoading(true);
        const res = await editorStore.installLibrary(url);
        setUrl('');
        if (res.isSuccess) {
          toast.toast({
            variant: 'default',
            title: 'Library installed successfully 🎉',
          });
        } else if (!res.isError) {
          toast.toast({
            variant: 'destructive',
            title: "Nilefy doesn't support this library yet",
          });
        } else {
          throw new Error('');
        }
      } catch (e) {
        toast.toast({
          variant: 'destructive',
          title: 'Failed to install library, please try again later',
          action: (
            <Button
              variant="ghost"
              onClick={() => {
                handleInstallLibrary(url);
              }}
            >
              Retry
            </Button>
          ),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );
  const isValid = validation.success || url === '';
  return (
    <div className="h-full w-full">
      <div className="flex w-full items-center gap-2">
        <form className="w-full">
          <Label htmlFor="library-url">Library URL</Label>
          <div className="flex w-full gap-2 py-2">
            <div className="flex w-full flex-col">
              <Input
                placeholder="https://cdn.jsdelivr.net/npm/example@1.1.1/example.min.js"
                id="library-url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
                disabled={isLoading}
              />
              <span className="h-4 pt-1 text-sm text-red-500">
                {isValid ? '' : 'Please enter a valid URL'}
              </span>
            </div>
            <Button
              type="button"
              className="ml-auto flex w-28 gap-1"
              title={'Add a new library'}
              disabled={!isValid || isLoading || url === ''}
              onClick={() => handleInstallLibrary(url)}
              variant="outline"
            >
              {isLoading ? (
                <WebloomLoader />
              ) : (
                <>
                  <span>Install</span>
                  <CloudDownload className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      <Accordion className="h-full w-full" type="multiple">
        {entries(editorStore.libraries).map(([libraryName, library]) => (
          <AccordionItem
            key={libraryName}
            value={libraryName}
            className="border-0"
          >
            <AccordionTrigger
              arrowPosition="left"
              className="group py-3 text-sm hover:no-underline"
            >
              <div className="flex h-8 w-full items-center justify-start gap-2 px-2">
                <span className="w-1/4  truncate text-start font-normal">
                  {libraryName}
                </span>
                <span className="ml-auto shrink-0 font-normal">
                  {library.version ?? ''}
                </span>
                {library.isDefault ? null : (
                  <Button
                    variant="destructive"
                    asChild
                    className="hidden h-fit w-fit px-2 group-hover:block"
                    onClick={() => {
                      editorStore.uninstallLibrary(libraryName);
                    }}
                    title="Remove library"
                  >
                    <div>
                      <Trash className="h-4 w-4" />
                    </div>
                  </Button>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <div className="ml-2 flex items-center gap-2 px-2 text-sm">
                <div className="w-full truncate font-normal">Available as:</div>
                <Input
                  value={library.availabeAs}
                  onChange={() => {
                    //do nothing
                  }}
                />
              </div>
              <div className="ml-2 flex items-center gap-2 px-2 text-sm">
                <Label
                  htmlFor="library-url"
                  className="w-full truncate font-normal"
                >
                  URL
                </Label>
                <Input
                  value={library.url}
                  onChange={() => {
                    //do nothing
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
});
