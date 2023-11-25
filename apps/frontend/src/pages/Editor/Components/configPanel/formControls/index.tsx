import { InspectorInput } from './Input';
import { InspectorSelect } from './Select';

export const InspectorFormControls = {
  input: InspectorInput,
  select: InspectorSelect,
} as const;
