import { InspectorInput } from './input';
import { InspectorSelect } from './select';
import { SqlEditor } from './sqlEditor';
import { InspectorList } from './list';
import { InspectorCheckBox } from './checkbox';
import { InlineCodeInput } from './inlineCodeInput';

export const InspectorFormControls = {
  input: InspectorInput,
  select: InspectorSelect,
  sqlEditor: SqlEditor,
  list: InspectorList,
  checkbox: InspectorCheckBox,
  inlineCodeInput: InlineCodeInput,
} as const;
