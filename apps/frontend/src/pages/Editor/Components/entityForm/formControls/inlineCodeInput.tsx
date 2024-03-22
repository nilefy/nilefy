import { InlineCodeInputProps } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { EntityFormControlContext } from '..';
import { WebloonInlineInputFormControl } from '@/pages/Editor/Components/CodeEditor/inlineEditor';

const InspectorInlineCodeInput = (props: InlineCodeInputProps) => {
  const { onChange, value, onFocus, onBlur } = useContext(
    EntityFormControlContext,
  );

  // TODO: we convert non string value to js template, until the validation code could handle this case
  const correctValue =
    typeof value === 'string' ? value : `{{${JSON.stringify(value ?? '')}}}`;

  return (
    <WebloonInlineInputFormControl
      value={correctValue}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={props.placeholder}
    />
  );
};

export default InspectorInlineCodeInput;
