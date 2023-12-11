import { InspectorInput } from './input';
import { InspectorSelect } from './select';
import { SqlEditor } from './sqlEditor';
import { InspectorList } from './list';
import { InspectorCheckBox } from './checkbox';
import { InlineCodeInput } from './inlineCodeInput';
import InspectorEventItem from './events';
import { InspectorColor } from './colorPicker';
import EventManager from './eventManagerButton';

export const InspectorFormControls = {
  input: InspectorInput,
  select: InspectorSelect,
  sqlEditor: SqlEditor,
  list: InspectorList,
  checkbox: InspectorCheckBox,
  inlineCodeInput: InlineCodeInput,
  events: InspectorEventItem,
  color: InspectorColor,
  EventManagerButton: EventManager,
} as const;
