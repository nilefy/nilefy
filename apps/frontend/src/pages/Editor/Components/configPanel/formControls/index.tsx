import { InspectorColor } from './colorPicker';
import EventManagerButton from './eventManagerButton';
import InspectorEventManger from './events';
import { InspectorInput } from './input';
import { InspectorSelect } from './select';

export const InspectorFormControls = {
  input: InspectorInput,
  select: InspectorSelect,
  color: InspectorColor,
  event: InspectorEventManger,
  EventManagerButton: EventManagerButton,
} as const;
