import { editorStore } from '@/lib/Editor/Models';
import Selecto from 'react-selecto';
import { observer } from 'mobx-react-lite';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { commandManager } from '@/Actions/CommandManager';
import { SelectionAction } from '@/Actions/Editor/selection';

const MultiSelect = observer(() => {
  if (!editorStore.currentPage.rootWidget.dom) return null;
  return (
    <Selecto
      // The container to add a selection element
      container={editorStore.currentPage.rootWidget.dom}
      dragContainer={editorStore.currentPage.rootWidget.dom}
      selectableTargets={['.target']}
      selectFromInside={true}
      selectByClick={false}
      hitRate={100}
      dragCondition={(e) => {
        const triggerTarget = e.inputEvent.target;
        const isRoot = triggerTarget.getAttribute('data-id');
        return isRoot === EDITOR_CONSTANTS.ROOT_NODE_ID;
      }}
      onSelect={(e) => {
        e.added.forEach((el) => {
          const data = el.getAttribute('data-id');
          if (data) {
            commandManager.executeCommand(new SelectionAction(data, true));
          }
        });
        e.removed.forEach((el) => {
          const data = el.getAttribute('data-id');
          if (data) {
            editorStore.currentPage.setSelectedNodeIds((prev) => {
              return new Set([...prev].filter((i) => i !== data));
            });
          }
        });
      }}
    />
  );
});

export { MultiSelect };
