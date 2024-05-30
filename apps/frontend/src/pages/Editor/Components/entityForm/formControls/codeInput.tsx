import { useContext } from 'react';
import { EntityFormControlContext } from '..';
import { CodeInput } from '../../CodeEditor';

const InspectorCodeInput = () => {
  const { onChange, value, onFocus, onBlur, entityId, path, id } = useContext(
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
      id={id}
      fileName={`${entityId}_${path}`}
    />
  );
};

export default InspectorCodeInput;
