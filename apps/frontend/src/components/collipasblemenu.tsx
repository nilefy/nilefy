import * as React from "react";
import { ChevronsUpDown,ChevronsRight,ChevronsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ROOT_NODE_ID } from '@/lib/constants';
import store, { WebloomNode } from '@/store';

type Props = {
  [key: string]: any;
};

function recursiveProps(props: Props, openPropsStates: Record<string, boolean>, setOpenPropsStates: React.Dispatch<React.SetStateAction<Record<string, boolean>>>): JSX.Element[] {
  const collectedProps: JSX.Element[] = [];
  

  for (const key in props) {
    if (props.hasOwnProperty(key)) {
      const prop = props[key];

      if (typeof prop === 'object') {
        const isOpen = openPropsStates[key] || false;
        collectedProps.push(
          <Collapsible className={`  px-0 py-0 font-mono text-sm`} open={isOpen}
          onOpenChange={(newOpenState) => {
            setOpenPropsStates((prevState) => ({
              ...prevState,
              [key]: newOpenState, // Update the open state for this property
            }));
          }}>
            <div className="flex items-center  justify-start">
            <CollapsibleTrigger asChild>
       
            <Button variant="ghost" size="sm" className="w-9 p-0">
         
            {openPropsStates[key]? 
             <ChevronsDown className="h-4 w-4" />
             :<ChevronsRight className="h-4 w-4" />
            }
            
           </Button>
     </CollapsibleTrigger>
     <h4 className="text-sm font-semibold">
            {key}
            </h4>
            <p className="text-xs ml-2">{typeof(prop)}   {Object.keys(prop).length} entries</p>
            </div>
          <CollapsibleContent className="space-y-0 border-l-2 pl-4 ml-4">
         { recursiveProps(prop,openPropsStates,setOpenPropsStates)}
         
          </CollapsibleContent>
          </Collapsible>
        );
       
      } else {
        // Display the non-object property
        collectedProps.push(
          <div key={key}>
            <p className="text-xs inline">{key}</p>
            <p className="text-xs inline text-orange-600"> "{prop}"</p>
          </div>
        );
      }
    }
  }

  return collectedProps;
}

const myProps = {
  prop1: 'value1',
  prop2: {
    nestedProp1: 'nestedValue1',
    nestedProp2: {
      deeplyNestedProp: 'deeplyNestedValue'
    }
  }
};

export function CollapsibleMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const root = store((state) => state.tree[ROOT_NODE_ID]);
  const initialState = root.nodes.reduce((acc, nodeId) => {
    (acc as any)[nodeId] = false;
    return acc;
  }, {} as Record<string, boolean>);
   const[open,setOpen] = React.useState(initialState);
   
   const initialPropsOpenStates: Record<string, boolean> = {};
   for (const key in myProps) {
     if (myProps.hasOwnProperty(key)) {
       initialPropsOpenStates[key] = false;
     }
   }
   const [openPropsStates, setOpenPropsStates] = React.useState(initialPropsOpenStates);
   const collectedProps = recursiveProps(myProps,openPropsStates,setOpenPropsStates);
  
 
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-[350px] space-y-0 font-mono"
    >
      <div className="flex items-center">
      <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
          {isOpen? 
             <ChevronsDown className="h-4 w-4" />
             :<ChevronsRight className="h-4 w-4" />
            }
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <h4 className="text-sm font-semibold">
          Components
        </h4>
        <p className="text-xs ml-4">{typeof(root)}   {root.nodes.length} entries</p>
      </div>
      <CollapsibleContent className="space-y-2 border-l-2 ml-4">
      {root.nodes.map((nodeId)=>{
    const node = store.getState().tree[nodeId];
        return(
          <Collapsible key={node.id} open={open[nodeId]}
          onOpenChange={(newOpenState) => {
            setOpen((prevState) => ({
              ...prevState,
              [nodeId]: newOpenState
            }));
          }} className={`  px-0 py-0 font-mono text-sm`}>
          <div className="flex items-center space-x-2 px-0 justify-start">
          <CollapsibleTrigger asChild>
           
           <Button variant="ghost" size="sm" className="w-9 p-0">
             {open[nodeId]? 
             <ChevronsDown className="h-4 w-4" />
             :<ChevronsRight className="h-4 w-4" />
            }
           </Button>
         </CollapsibleTrigger>
    
            <h4 className="text-sm font-semibold">
              <button onClick={()=> store.getState().setSelectedNode(node.id)}>
            {node.name}
            </button>
            </h4>
           <p className="text-xs ml-2">  {typeof(node)}   {collectedProps.length} entries</p>
          </div>
          
          <CollapsibleContent className="space-y-0 border-l-2 pl-8 ml-4">
            {collectedProps}
       
          </CollapsibleContent>
        
          
        </Collapsible>
        )
})}
      </CollapsibleContent>
    </Collapsible>
  );
}
