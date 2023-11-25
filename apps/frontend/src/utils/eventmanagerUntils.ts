import store, { WebloomTree } from '../store';
interface ControlFunction {
  (data: unknown): void;
}
const node = store((state) => state.tree[0]);
export const createControlFunction = (
  targetComponent: string,
): ControlFunction => {
  return (data) => {
    // node.insertAdjacentHTML("afterend", data);
    console.log(`Controlling ${targetComponent} with data:`, data, node);
  };
};
