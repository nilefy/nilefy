import { editorStore } from '@/lib/Editor/Models';
import { ElementType, useCallback, useMemo, useEffect } from 'react';
import { WebloomWidgets, WidgetContext } from '..';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Grid, WebloomAdapter } from '.';
import { commandManager } from '@/Actions/CommandManager';
import { DeleteAction } from '@/Actions/Editor/Delete';
import { observer } from 'mobx-react-lite';
import {
  createPopperLite as createPopper,
  preventOverflow,
  flip,
} from '@popperjs/core';
import { Trash2 } from 'lucide-react';
export const WebloomElement = observer(function WebloomElement({
  id,
}: {
  id: string;
}) {
  const tree = editorStore.currentPage.getWidgetById(id);
  console.log(tree, 'tree');
  const nodes = tree.nodes;

  const onPropChange = useCallback(
    ({ value, key }: { value: unknown; key: string }) => {
      tree.setProp(key, value);
    },
    [tree],
  );

  const contextValue = useMemo(() => {
    return {
      onPropChange,
      id,
    };
  }, [onPropChange, id]);
  const WebloomWidget = WebloomWidgets[tree.type].component as ElementType;

  const selectedNode = editorStore.currentPage.firstSelectedWidget;
  const dims = selectedNode
    ? editorStore.currentPage.getWidgetById(selectedNode).pixelDimensions
    : null;
  useEffect(() => {
    createPopper(
      //@ts-expect-error bla
      document.querySelector(`[data-id="${selectedNode}"]`),
      document.querySelector(`#${selectedNode}`),
      {
        placement: 'top',
        modifiers: [preventOverflow, flip],
      },
    );
  }, [selectedNode, dims?.y]);

  if (id === EDITOR_CONSTANTS.PREVIEW_NODE_ID) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <WebloomAdapter draggable droppable resizable key={id} id={id}>
          {tree.isCanvas && <Grid id={id} />}
          <WidgetContext.Provider value={contextValue}>
            <WebloomWidget>
              {nodes.map((node) => (
                <>
                  {selectedNode == node && (
                    <WebloomAdapter draggable droppable overflow id={node}>
                      <div
                        id={node}
                        role="tooltip"
                        key={node}
                        className=" flex justify-between items-center absolute !translate-x-0 !-top-5 h-5 w-20 bg-blue-500 text-sm text-white"
                      >
                        <p>{node}</p>

                        <Trash2 size={16} />
                      </div>
                    </WebloomAdapter>
                  )}
                  <WebloomElement id={node} key={node} />
                </>
              ))}
            </WebloomWidget>
          </WidgetContext.Provider>
        </WebloomAdapter>
      </ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent>
          <ContextMenuItem
            onMouseDown={() => {
              commandManager.executeCommand(new DeleteAction());
            }}
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenu>
  );
});
