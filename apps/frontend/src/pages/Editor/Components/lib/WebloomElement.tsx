import store from '@/store';
import { ElementType, createElement, useCallback, useMemo } from 'react';
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

export function WebloomElement({ id }: { id: string }) {
  const wholeTree = store.getState().tree;
  const tree = wholeTree[id];
  const nodes = store((state) => state.tree[id].nodes);
  const props = store((state) => state.tree[id].props);
  // props = useEvaluation(id, props);
  const onPropChange = useCallback(
    ({ value, key }: { value: unknown; key: string }) => {
      store.getState().setProp(id, key, value);
    },
    [id],
  );
  const children = useMemo(() => {
    let children = props.children as React.ReactElement[];
    if (nodes.length > 0) {
      children = nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [nodes, props.children]);
  const contextValue = useMemo(() => {
    return {
      onPropChange,
      id,
    };
  }, [onPropChange, id]);
  const rendered = useMemo(
    () => (
      <WidgetContext.Provider value={contextValue}>
        {createElement(
          WebloomWidgets[tree.type].component as ElementType,
          props,
          children,
        )}
      </WidgetContext.Provider>
    ),
    [tree.type, props, children, contextValue],
  );
  if (id === EDITOR_CONSTANTS.PREVIEW_NODE_ID) return null;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <WebloomAdapter draggable droppable resizable key={id} id={id}>
          {tree.isCanvas && <Grid id={id} />}
          {rendered}
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
}
