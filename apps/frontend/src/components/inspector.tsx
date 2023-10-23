import { useState} from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MousePointer2, Pin,PinOff } from 'lucide-react';
import store from '@/store';
import { ROOT_NODE_ID } from '@/lib/constants';

export function Inspector() {
    const tree = store((state) => state.tree);
   
    const [open, setOpen] = useState(false);
   const[check,setChceck]=useState(false);
    const wait = () => new Promise((resolve) => setTimeout(resolve, 1));
//     let checkedValue = document.getElementById('check')as HTMLInputElement | null;
//    let  check=checkedValue?.checked;
   console.log(check);
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
            <h3>Components</h3>
            {
                Object.entries(tree).map(([key, value]) => (
                    <div key={key}>
                        <p>{key}</p>
                        <p className="ml-5">width : {value.width}</p>
                        <p className="ml-5">height : {value.height}</p>
                    </div>
                ))
            }
           
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
