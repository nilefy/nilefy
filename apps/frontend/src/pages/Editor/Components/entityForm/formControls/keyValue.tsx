import { Button } from '@/components/ui/button';
import InspectorArrayInput from './array';
import { Trash } from 'lucide-react';
import { memo } from 'react';

export const InspectorKeyValue = memo(() => {
  return (
    <InspectorArrayInput
      subform={[
        {
          path: 'key',
          type: 'inlineCodeInput',
          label: '',
          options: {
            placeholder: 'Key',
          },
        },
        {
          path: 'value',
          type: 'inlineCodeInput',
          label: '',
          options: {
            placeholder: 'Value',
          },
        },
      ]}
      FormWrapper={({ children }) => (
        <div className="flex w-full flex-row gap-1">{children}</div>
      )}
      SubFormWrapper={({ children, onDelete }) => {
        return (
          <div className="flex w-full flex-row items-center gap-1">
            {children}
            <Button
              size="icon"
              variant="outline"
              onClick={onDelete}
              className="ml-1"
            >
              <Trash size={16} />
            </Button>
          </div>
        );
      }}
      newItemDefaultValue={{ key: '', value: '' }}
    />
  );
});

InspectorKeyValue.displayName = 'InspectorKeyValue';
export default InspectorKeyValue;
