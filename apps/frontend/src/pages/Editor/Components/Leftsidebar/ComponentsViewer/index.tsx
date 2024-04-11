import { ChevronRight } from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { editorStore } from '@/lib/Editor/Models';
import { WebloomWidgets } from '../..';
import { cn } from '@/lib/cn';
import { useAutoRun } from '@/lib/Editor/hooks';
import { commandManager } from '@/actions/CommandManager';
import { RemoteSelectEntity } from '@/actions/Editor/remoteSelectEntity';
import { WidgetSelection } from '@/actions/Editor/selection';
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 w-full items-center py-2 transition-all last:[&[data-state=open]>svg]:rotate-90',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="text-accent-foreground/50 ml-auto h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className,
    )}
    {...props}
  >
    <div className="pb-1 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
export const ComponentTreeItem = observer(({ id }: { id: string }) => {
  const widget = editorStore.currentPage.getWidgetById(id);
  const config = WebloomWidgets[widget.type];
  const hasChildren = widget.nodes.length > 0;
  const isSelected = widget.isTheOnlySelected;

  const [expanded, setExpanded] = useState<string[]>([]);
  useAutoRun(() => {
    const newExpanded = widget.nodes.filter((node) => {
      const child = editorStore.currentPage.getWidgetById(node);
      return child.childrenHasSelected;
    });
    if (newExpanded.length > 0) {
      newExpanded.push(widget.id);
    }
    setExpanded(newExpanded);
  });
  const Icon = config.config.icon;
  return hasChildren ? (
    <div role="tree">
      <AccordionPrimitive.Root
        type="multiple"
        value={expanded}
        onValueChange={setExpanded}
      >
        <AccordionPrimitive.Item value={widget.id}>
          <AccordionTrigger
            onDoubleClick={() => {
              commandManager.executeCommand(
                WidgetSelection.remoteSelect(widget.id),
              );
            }}
            className={cn(
              'px-2 hover:before:opacity-100 before:absolute before:left-0 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10',
              isSelected &&
                'before:opacity-100 before:bg-accent text-accent-foreground before:border-l-2 before:border-l-accent-foreground/50 dark:before:border-0',
            )}
          >
            <Icon
              className="text-accent-foreground/50 mr-2 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate text-sm">{widget.id}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-2">
              {widget.nodes.map((node) => {
                return <ComponentTreeItem key={node} id={node} />;
              })}
            </div>
          </AccordionContent>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    </div>
  ) : (
    <Leaf id={id} />
  );
});

const Leaf = observer(({ id }: { id: string }) => {
  const widget = editorStore.currentPage.getWidgetById(id);
  const isSelected = widget.isTheOnlySelected;
  const Icon = WebloomWidgets[widget.type].config.icon;
  return (
    <div
      onDoubleClick={() => {
        commandManager.executeCommand(new RemoteSelectEntity(widget.id));
      }}
      onClick={() => {
        commandManager.executeCommand(WidgetSelection.remoteSelect(widget.id));
      }}
      className={cn(
        'flex items-center py-2 px-2 cursor-pointer \
        hover:before:opacity-100 before:absolute before:left-0 before:right-1 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10',
        isSelected &&
          'before:opacity-100 before:bg-accent text-accent-foreground before:border-l-2 before:border-l-accent-foreground/50 dark:before:border-0',
      )}
    >
      <Icon className="text-accent-foreground/50 mr-2 h-4 w-4 shrink-0" />
      <span className="grow truncate text-sm">{widget.id}</span>
    </div>
  );
});
