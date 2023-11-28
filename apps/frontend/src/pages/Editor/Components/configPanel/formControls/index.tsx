import { InspectorColor } from './colorPicker';
import { InspectorInput } from './input';
import { InspectorSelect } from './select';

export const InspectorFormControls = {
  input: InspectorInput,
  select: InspectorSelect,
  color: InspectorColor,
} as const;
