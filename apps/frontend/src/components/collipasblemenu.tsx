import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ROOT_NODE_ID } from '@/lib/constants';
import store, { WebloomNode } from '@/store';

interface TreeNode {
  nodes: TreeNode[];
  // You can add other properties here if needed
}

export function CollapsibleMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const root = store((state) => state.tree[ROOT_NODE_ID]);
 
  
  const renderNodes = (node: WebloomNode, depth: number): JSX.Element => {
   
   return(
    <Collapsible key={node.id}  className={`ml-${depth * 4}  px-4 py-3 font-mono text-sm`}>
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          <button onClick={()=> store.getState().setSelectedNode(node.id)}>
        {node.name}
        </button>
        </h4>
        <CollapsibleTrigger asChild>
       
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        
        </CollapsibleTrigger>
      </div>
      
      {node.nodes.length > 0 ?(
        <CollapsibleContent className="space-y-2">
          {node.nodes.map((childNodeId) => {
            const childNode = store.getState().tree[childNodeId];
            return renderNodes(childNode, depth + 1);
          })}
        </CollapsibleContent>
      ):(
        
      <CollapsibleContent className="space-y-2 border-l-2 pl-1 mx-6">
      <p>width : {node.width}</p>
      <p>height : {node.height}</p>
      </CollapsibleContent>
    
      )}
    </Collapsible>
  );
        }
  
  

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-[350px] space-y-2"
    >
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          Components
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2 border-0">
      {renderNodes(root, 0)}
      </CollapsibleContent>
    </Collapsible>
  );
}
