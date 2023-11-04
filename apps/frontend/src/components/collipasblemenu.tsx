import * as React from "react";
import { ChevronsUpDown,ChevronsRight,ChevronsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ROOT_NODE_ID } from '@/lib/constants';
import store, { WebloomNode } from '@/store';

type Props = {
  [key: string]: any;
};

function recursiveProps(props: Props, collectedProps: any[] = []) {
  for (const key in props) {
    if (props.hasOwnProperty(key)) {
      const prop = props[key];

      if (typeof prop === 'object') {
        recursiveProps(prop, collectedProps); // Recurse on the object
      } else {
        // Add the non-object property to the collectedProps array
        collectedProps.push({ key, value: prop });
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

const collectedProps = recursiveProps(myProps);

console.log(collectedProps,"props");

export function CollapsibleMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const root = store((state) => state.tree[ROOT_NODE_ID]);
  
  // const renderNodes = (node: WebloomNode): JSX.Element => {
   
  //  return(
  //   <Collapsible key={node.id}  className={`  px-4 py-0 font-mono text-sm`}>
  //     <div className="flex items-center space-x-4 px-4 justify-start">
  //     <CollapsibleTrigger asChild>
       
  //      <Button variant="ghost" size="sm" className="w-9 p-0">
  //        <ChevronsUpDown className="h-4 w-4" />
  //        <span className="sr-only">Toggle</span>
  //      </Button>
  //    </CollapsibleTrigger>

  //       <h4 className="text-sm font-semibold">
  //         <button onClick={()=> store.getState().setSelectedNode(node.id)}>
  //       {node.name}
  //       </button>
  //       </h4>
  //      <p className="text-xs">{typeof(node)}   {collectedProps.length} entries</p>
  //     </div>
      
  //     {node.nodes.length > 0 ?(
  //       <CollapsibleContent className="space-y-1">
  //         {node.nodes.map((childNodeId) => {
  //           const childNode = store.getState().tree[childNodeId];
  //           return renderNodes(childNode);
  //         })}
  //       </CollapsibleContent>
  //     ):(
        
  //     <CollapsibleContent className="space-y-0 border-l-2 pl-8 ml-9">
  //       {collectedProps.map((prop)=>(
  //         <div>
  //          <p className="text-xs inline">{prop.key} </p> 
  //          <p className="text-xs inline text-orange-600"> "{prop.value}"</p>
  //          </div>
  //       ))}
   
  //     </CollapsibleContent>
    
  //     )}
  //   </Collapsible>
  // );
  //       }
  
  console.log(root)
  const initialState = root.nodes.reduce((acc, nodeId) => {
    (acc as any)[nodeId] = false;
    return acc;
  }, {} as Record<string, boolean>);
  
  // Create a state variable to hold the open/closed state for each node
  const[open,setOpen] = React.useState(initialState);
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
            {collectedProps.map((prop)=>(
              <div>
               <p className="text-xs inline">{prop.key} </p> 
               <p className="text-xs inline text-orange-600"> "{prop.value}"</p>
               </div>
            ))}
       
          </CollapsibleContent>
        
          
        </Collapsible>
        )
})}
      </CollapsibleContent>
    </Collapsible>
  );
}
