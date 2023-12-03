import * as React from 'react';
import { ChevronsRight, ChevronsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import store from '@/store';
import { commandManager } from '@/Actions/CommandManager';
import { SelectionAction } from '@/Actions/Editor/selection';
import { ROOT_NODE_ID } from '@/lib/Editor/constants';
type ElementProps = {
  [key: string]: unknown;
};

const myProps = {
  prop1: 0,
  prop: function bla() {},
  prop2: {
    nestedProp1: 'nestedValue1',
    nestedProp2: {
      deeplyNestedProp: 'deeplyNestedValue',
    },
  },
  prop22: {
    nestedProp1: 'nestedValue1',
    nestedProp2: {
      deeplyNestedProp: 'deeplyNestedValue',
    },
  },
  prop23: {
    nestedProp1: 'nestedValue1',
    nestedProp2: {
      deeplyNestedProp: 'deeplyNestedValue',
    },
  },
  prop24: {
    nestedProp1: 'nestedValue1',
    nestedProp2: {
      deeplyNestedProp: 'deeplyNestedValue',
    },
  },
  prop3: {
    bla1: ['nestedValue1', 'dwwdkl', 0],
    bla2: false,
  },
};

export function JsonViewer() {
  const trueTypeOf = (obj: unknown) =>
    Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  const [isOpen, setIsOpen] = React.useState(false);
  const root = store((state) => state.tree[ROOT_NODE_ID]);
  const initialState = root.nodes.reduce(
    (acc, nodeId) => {
      (acc as Record<string, boolean>)[nodeId] = false;
      return acc;
    },
    {} as Record<string, boolean>,
  );
  const [open, setOpen] = React.useState(initialState);

  const initialPropsOpenStates: Record<string, boolean> = {};
  for (const key in myProps) {
    initialPropsOpenStates[key] = false;
  }
  const [openPropsStates, setOpenPropsStates] = React.useState(
    initialPropsOpenStates,
  );

  const recursiveProps = (props: ElementProps) => {
    const collectedProps: JSX.Element[] = [];
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const prop = props[key];
        if (typeof prop === 'object' && prop != null) {
          const isOpen = openPropsStates[key] || false;
          collectedProps.push(
            <Collapsible
              className={`  p-0 font-mono text-sm`}
              open={isOpen}
              onOpenChange={(newOpenState) => {
                setOpenPropsStates((prevState) => ({
                  ...prevState,
                  [key]: newOpenState, // Update the open state for this property
                }));
              }}
            >
              <div className="flex items-center">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="-ml-9  w-9 p-0">
                    {openPropsStates[key] ? (
                      <ChevronsDown className=" h-4 w-4" />
                    ) : (
                      <ChevronsRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <h4 className="text-sm font-semibold">{key}</h4>
                <p className="ml-2 text-xs">
                  {trueTypeOf(prop)} {Object.keys(prop!).length} entries
                </p>
              </div>
              <CollapsibleContent className="-ml-5 space-y-0 border-l-2 pl-10">
                {recursiveProps(prop as ElementProps)}
              </CollapsibleContent>
            </Collapsible>,
          );
        } else {
          // Display the non-object property
          collectedProps.push(
            <div key={key} className="">
              <p className="inline text-xs">{key} </p>
              <p className="inline text-xs text-orange-600">
                &quot;{String(prop)}&quot;
              </p>
              <p className="ml-2 inline text-xs">{trueTypeOf(prop)}</p>
            </div>,
          );
        }
      }
    }
    return collectedProps;
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="h-full w-full space-y-0 overflow-y-auto font-mono scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-700 dark:scrollbar-track-white dark:scrollbar-thumb-gray-700"
    >
      <div className="flex items-center">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isOpen ? (
              <ChevronsDown className="h-4 w-4" />
            ) : (
              <ChevronsRight className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
        <h4 className="text-sm font-semibold">Components</h4>
        <p className="ml-4 text-xs">
          {typeof root} {root.nodes.length} entries
        </p>
      </div>
      <CollapsibleContent className="ml-4 space-y-2 border-l-2">
        {root.nodes.map((nodeId) => {
          const node = store.getState().tree[nodeId];
          return (
            <Collapsible
              key={node.id}
              open={open[nodeId]}
              onOpenChange={(newOpenState) => {
                setOpen((prevState) => ({
                  ...prevState,
                  [nodeId]: newOpenState,
                }));
              }}
              className={`  p-0 font-mono text-sm`}
            >
              <div className="flex items-center justify-start space-x-2 px-0">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {open[nodeId] ? (
                      <ChevronsDown className="h-4 w-4" />
                    ) : (
                      <ChevronsRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <h4 className="text-sm font-semibold">
                  <button
                    onClick={() =>
                      commandManager.executeCommand(
                        new SelectionAction(node.id),
                      )
                    }
                  >
                    {node.name}
                  </button>
                </h4>
                <p className="ml-2 text-xs">
                  {' '}
                  {typeof node} {root.nodes.length} entries
                </p>
              </div>

              <CollapsibleContent className="ml-4 space-y-0 border-l-2 pl-8">
                {recursiveProps(myProps)}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
