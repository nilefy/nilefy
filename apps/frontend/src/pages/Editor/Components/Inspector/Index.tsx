import store from '@/store';
import { WebloomWidgets } from '..';
import { InspectorFormControls } from './FormControls';

export const Inspector = () => {
  const selected = store((state) => state.selectedNodeIds);
  const selectedId = [...selected][0];
  const selectedNode = store.getState().tree[selectedId];
  const selectedNodeProps = store(
    (state) => state.tree[selectedId].widget.props,
  );
  const inspectorConfig =
    WebloomWidgets[selectedNode.widget.type].inspectorConfig;

  return inspectorConfig.map((section) => {
    return (
      <div key={section.sectionName}>
        <div>{section.sectionName}</div>
        {section.children.map((control) => {
          const Component = InspectorFormControls[control.type];
          const options = {
            ...control,
            ...control.options,
            value: selectedNodeProps[control.key],
          };
          const onChange = (newValue: unknown) => {
            store.getState().setProp(selectedId, control.key, newValue);
          };
          return <Component {...options} onChange={onChange} />;
        })}
      </div>
    );
  });
};
