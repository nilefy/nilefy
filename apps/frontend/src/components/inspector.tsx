import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { MousePointer2, Pin, PinOff } from 'lucide-react';
import { JsonViewer } from './JsonViewer';

export function Inspector() {
  const [open, setOpen] = useState(false);
  const [check, setChceck] = useState(false);

  return (
    <Sheet
      key={'left'}
      open={!check ? open : check}
      onOpenChange={setOpen}
      modal={false}
    >
      <SheetTrigger className="flex items-center justify-center">
        <MousePointer2 className="h-8 w-8 rotate-0 scale-100 cursor-pointer transition-all" />
      </SheetTrigger>
      <SheetContent side={'left'} className="left-14">
        <SheetHeader>
          <SheetTitle>Inspector</SheetTitle>
          <div className="absolute right-3">
            {' '}
            <label htmlFor="check">
              {check ? <PinOff /> : <Pin />}
              <input
                hidden
                type="checkbox"
                name="check"
                id="check"
                onChange={(e) => {
                  setOpen(true);
                  setChceck(e.target.checked);
                }}
              />
            </label>
          </div>
        </SheetHeader>

        <div className="h-full w-full py-4">
          <JsonViewer />
        </div>
      </SheetContent>
    </Sheet>
  );
}
