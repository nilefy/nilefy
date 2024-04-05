import * as React from 'react';
import { ChevronsRight, ChevronsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { editorStore } from '@/lib/Editor/Models';

import { commandManager } from '@/actions/CommandManager';
import { WidgetSelection } from '@/actions/Editor/selection';
import { observer } from 'mobx-react-lite';

// TODO: add real JSON type, you can copy it from `typefest`
type ElementProps = {
  [key: string]: unknown;
};

function trueTypeOf(obj: unknown) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}

function CollapsibleTriggerWithChevr({ isOpen }: { isOpen: boolean }) {
  return (
    <CollapsibleTrigger asChild>
      <Button variant="ghost" size="icon" className="w-9">
        {isOpen ? (
          <ChevronsDown className=" h-4 w-4" />
        ) : (
          <ChevronsRight className="h-4 w-4" />
        )}
      </Button>
    </CollapsibleTrigger>
  );
}

function RecursiveProps({
  parentKey,
  elementProps,
}: {
  parentKey: string;
  elementProps: ElementProps;
}) {
  const [openPropsStates, setOpenPropsStates] = React.useState<
    Record<string, boolean>
  >({});

  const collectedProps: JSX.Element[] = [];

  for (const key in elementProps) {
    const prop = elementProps[key];
    if (typeof prop === 'object' && prop != null) {
      const isOpen = openPropsStates[key] || false;
      collectedProps.push(
        <Collapsible
          key={parentKey + key}
          className="p-0 font-mono text-sm"
          open={isOpen}
          onOpenChange={(newOpenState) => {
            setOpenPropsStates((prevState) => ({
              ...prevState,
              [key]: newOpenState, // Update the open state for this property
            }));
          }}
        >
          <div className="flex items-center">
            <CollapsibleTriggerWithChevr isOpen={openPropsStates[key]} />
            <h4 className="text-sm font-semibold">{key}</h4>
            <p className="ml-2 text-xs">
              {trueTypeOf(prop)} {Object.keys(prop).length} entries
            </p>
          </div>
          <CollapsibleContent className="-ml-5 space-y-0 border-l-2 pl-10">
            <RecursiveProps
              parentKey={parentKey + key}
              elementProps={prop as ElementProps}
            />
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
  return collectedProps;
}

/**
 * don't let the name mislead you
 * this component can only works with editor state
 */
export const JsonViewer = observer(function JsonViewer() {
  const [isComponentsOpen, setIsComponentsOpen] = React.useState(false);
  const root = editorStore.currentPage.rootWidget;
  const [isSingleNodeOpen, setIsSingleNodeOpen] = React.useState<
    Record<string, boolean>
  >({});

  return (
    <Collapsible
      open={isComponentsOpen}
      onOpenChange={setIsComponentsOpen}
      className="scrollbar-thin scrollbar-track-foreground/10 scrollbar-thumb-primary/10 h-full w-full space-y-0 overflow-y-auto font-mono"
    >
      <div className="flex items-center">
        <CollapsibleTriggerWithChevr isOpen={isComponentsOpen} />
        <h4 className="text-sm font-semibold">Components</h4>
        <p className="ml-4 text-xs">
          {typeof root} {root.nodes.length} entries
        </p>
      </div>
      <CollapsibleContent className="ml-4 space-y-2 border-l-2">
        {root.nodes.map((nodeId) => {
          const node = editorStore.currentPage.getWidgetById(nodeId);
          const nodeProps = node.values;
          return (
            <Collapsible
              key={node.id}
              open={isSingleNodeOpen[nodeId] || false}
              onOpenChange={(newOpenState) => {
                setIsSingleNodeOpen((prevState) => ({
                  ...prevState,
                  [nodeId]: newOpenState,
                }));
              }}
              className="p-0 font-mono text-sm"
            >
              <div className="flex items-center justify-start space-x-2 px-0">
                <CollapsibleTriggerWithChevr
                  isOpen={isSingleNodeOpen[nodeId] || false}
                />
                <h4 className="text-sm font-semibold">
                  <button
                    onClick={() => {
                      commandManager.executeCommand(
                        WidgetSelection.remoteSelect(node.id),
                      );
                      editorStore.currentPage
                        .getWidgetById(node.id)
                        .dom?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                          inline: 'center',
                        });
                    }}
                  >
                    {node.id}
                  </button>
                </h4>
                <p className="ml-2 text-xs">
                  {typeof node} {Object.keys(nodeProps).length} entries
                </p>
              </div>

              <CollapsibleContent className="ml-4 space-y-0 border-l-2 pl-8">
                <RecursiveProps elementProps={nodeProps} parentKey={node.id} />
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
});
