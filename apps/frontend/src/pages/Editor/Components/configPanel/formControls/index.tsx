import { InspectorColor } from './colorPicker';
import InspectorEventManger from './event';
import { InspectorInput } from './input';
import { InspectorSelect } from './select';

export const InspectorFormControls = {
  input: InspectorInput,
  select: InspectorSelect,
  color: InspectorColor,
  event: InspectorEventManger,
} as const;
