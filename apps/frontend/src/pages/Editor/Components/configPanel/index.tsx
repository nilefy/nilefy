import store from '@/store';
import { WebloomWidgets } from '..';
import { commandManager } from '@/actions/commandManager';
import { ChangePropAction } from '@/Actions/Editor/changeProps';
import { ConfigForm, ConfigFormGenricOnChange } from '@/components/configForm';

export const ConfigPanel = () => {
  const selected = store((state) => state.selectedNodeIds);
  const selectedId = [...selected][0];
  const selectedNode = store.getState().tree[selectedId];
  const selectedNodeProps = store((state) => state.tree[selectedId].props);
  const inspectorConfig = WebloomWidgets[selectedNode.type].inspectorConfig;

  const onChange: ConfigFormGenricOnChange = (key, newValue) => {
    commandManager.executeCommand(
      new ChangePropAction(selectedId, key, newValue),
    );
  };
  return (
    <ConfigForm
      config={inspectorConfig}
      itemProps={selectedNodeProps}
      onChange={onChange}
    />
  );
};
