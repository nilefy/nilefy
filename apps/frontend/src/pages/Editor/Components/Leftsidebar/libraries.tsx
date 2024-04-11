import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { editorStore } from '@/lib/Editor/Models';
import { AccordionContent } from '@radix-ui/react-accordion';
import { entries } from 'lodash';
import { observer } from 'mobx-react-lite';

export const Libraries = observer(() => {
  return (
    <Accordion className="h-full w-full" type="multiple">
      {entries(editorStore.libraries).map(([libraryName, library]) => (
        <AccordionItem
          key={libraryName}
          value={libraryName}
          className="border-0"
        >
          <AccordionTrigger className="py-3 text-sm hover:no-underline">
            <div className="flex w-full justify-start gap-2 px-2">
              <span className="w-1/4  truncate text-start font-normal">
                {libraryName}
              </span>
              <span className="ml-auto shrink-0 font-normal">
                {library.version ?? ''}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="ml-2 flex items-center gap-2 px-2 text-sm">
              <div className="w-full truncate font-normal">Available as:</div>
              <Input
                value={library.availabeAs}
                onChange={() => {
                  //do nothing
                }}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
});
