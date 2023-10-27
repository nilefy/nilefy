import { useState} from "react"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";


import { MousePointer2, Pin,PinOff } from 'lucide-react';


import { CollapsibleMenu } from "./collipasblemenu";

export function Inspector() {
   
    const [open, setOpen] = useState(false);
   const[check,setChceck]=useState(false);
   
  return (
    <Sheet key={"left"} open={!check?open:check} onOpenChange={setOpen} modal={false}>
    <SheetTrigger asChild>
        <MousePointer2 className="h-8 w-8 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 cursor-pointer" />
    </SheetTrigger>
    <SheetContent side={"left"} >
        <SheetHeader>
            <SheetTitle>Inspector</SheetTitle>
            <div className="absolute right-3"> <label htmlFor="check">
           {check? <PinOff/>:<Pin/>}
            <input hidden type="checkbox" name="check" id="check" onChange={(e)=>{setOpen(true);setChceck(e.target.checked)}}/></label></div>
            <SheetDescription>
             
            </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
         
           <CollapsibleMenu/>

           
           
        </div>
        <SheetFooter>
          {/* <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
