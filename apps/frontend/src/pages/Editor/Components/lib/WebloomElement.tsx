import { editorStore } from '@/lib/Editor/Models';
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
import { observer } from 'mobx-react-lite';

export const WebloomElement = observer(function WebloomElement({
  id,
  isPreview,
}: {
  id: string;
  isPreview: boolean;
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

  if (id === EDITOR_CONSTANTS.PREVIEW_NODE_ID) return null;
  const Rendering = () => (
    <>
      <WebloomAdapter
        draggable={!isPreview}
        droppable={!isPreview}
        resizable={!isPreview}
        isPreview={isPreview}
        key={id}
        id={id}
      >
        {tree.isCanvas && <Grid id={id} />}
        <WidgetContext.Provider value={contextValue}>
          <WebloomWidget>
            {nodes.map((nodeId) => (
              <WebloomElement id={nodeId} key={nodeId} isPreview={isPreview} />
            ))}
          </WebloomWidget>
        </WidgetContext.Provider>
      </WebloomAdapter>
    </>
  );

  if (isPreview) return <Rendering />;
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Rendering />
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
