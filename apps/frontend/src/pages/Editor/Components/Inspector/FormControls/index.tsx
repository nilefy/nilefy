import { InspectorInput, InspectorInputProps } from './Input';
import { InspectorSelect, InspectorSelectProps } from './Select';
export type BaseControlProps = {
  id: string;
  label: string;
  defaultValue?: string | number;
  value?: string | number;
};
export const InspectorFormControls = {
  input: InspectorInput,
  select: InspectorSelect,
} as const;
export type { InspectorInputProps, InspectorSelectProps };
