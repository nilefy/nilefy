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
export const WebloomElement = observer(function WebloomElement({
  id,
}: {
  id: string;
}) {
  const tree = editorStore.currentPage.getWidgetById(id);
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
  // const selectedNode = Array.from(editorStore.currentPage.selectedNodeIds);
  // console.log(id,"id");
  // useEffect(() => {
  //   createPopper(
      //@ts-expect-error bla
  //     document.querySelector(`[data-id="${id}"]`),
  //     document.querySelector(`#${selectedNode[0]}`),
  //     {
  //       placement: 'top',
  //       modifiers: [preventOverflow, flip],
  //     },
  //   );
  // }, [selectedNode[0]]);

  if (id === EDITOR_CONSTANTS.PREVIEW_NODE_ID) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <WebloomAdapter draggable droppable resizable key={id} id={id}>
          {tree.isCanvas && <Grid id={id} />}
          <WidgetContext.Provider value={contextValue}>
            <WebloomWidget>
              {/* <div id={selectedNode[0]} role="tooltip">
                {selectedNode[0]}
              </div> */}
              {nodes.map((node) => (
                <WebloomElement id={node} key={node} />
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
