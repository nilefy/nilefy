import { editorStore } from '@/lib/Editor/Models';
// import store from '@/store';
import { ElementType, useCallback, useMemo } from 'react';
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
// import { useShallow } from 'zustand/react/shallow';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
// import { useEvaluation } from '@/lib/Editor/evaluation';

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
      // store.getState().setProp(id, key, value);
    },
    [tree],
  );
  const children = useMemo(() => {
    let children: React.ReactNode[] = [];
    if (nodes.length > 0) {
      children = nodes.map((node) => {
        return <WebloomElement id={node} key={node} />;
      });
    }
    return children;
  }, [nodes]);
  const contextValue = useMemo(() => {
    return {
      onPropChange,
      id,
    };
  }, [onPropChange, id]);
  const Component = WebloomWidgets[tree.type].component as ElementType;

  if (id === EDITOR_CONSTANTS.PREVIEW_NODE_ID) return null;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <WebloomAdapter draggable droppable resizable key={id} id={id}>
          {tree.isCanvas && <Grid id={id} />}
          <WidgetContext.Provider value={contextValue}>
            <Component>{children}</Component>
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
