import { useContext } from 'react';
import { EntityFormControlContext } from '..';
import { CodeInput } from '../../CodeEditor';

const InspectorCodeInput = () => {
  const { onChange, value, onFocus, onBlur, entityId, path } = useContext(
    EntityFormControlContext,
  );

  const correctValue =
    typeof value === 'string' ? value : `${JSON.stringify(value ?? '')}`;

  return (
    <CodeInput
      value={correctValue}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      fileName={`${entityId}.${path}`}
    />
  );
};

export default InspectorCodeInput;
