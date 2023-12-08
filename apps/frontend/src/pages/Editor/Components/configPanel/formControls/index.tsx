import { InlineCodeInput } from './inlineCodeInput';
import { InspectorInput } from './input';
import { InspectorSelect } from './select';
import { SqlEditor } from './sqlEditor';

export const InspectorFormControls = {
  input: InspectorInput,
  select: InspectorSelect,
  sqlEditor: SqlEditor,
  inlineCodeInput: InlineCodeInput,
} as const;
