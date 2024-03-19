import { Button } from '@/components/ui/button';
import { ArrayInputProps } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { EntityFormControl, EntityFormControlContext } from '..';
import { hashKey } from '@/lib/utils';

export const InspectorArrayInput = (props: ArrayInputProps) => {
  const { value, onChange, path, entityId } = useContext(
    EntityFormControlContext,
  );
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col gap-2">
        {(value as unknown[]).map((subformItem, index) => {
          return (
            <FormWrapper
              key={hashKey(subformItem)}
              value={value as unknown[]}
              onDelete={() => {
                const newValue = [...(value as unknown[])];
                newValue.splice(index, 1);
                onChange(newValue);
              }}
            >
              <Form
                subForm={props.subform}
                index={index}
                id={entityId}
                orgPath={path}
              />
            </FormWrapper>
          );
        })}
      </div>
      <div>
        <Button
          size="sm"
          onClick={() => {
            onChange([...(value as unknown[]), props.newItemDefaultValue]);
          }}
        >
          Add Dataset
        </Button>
      </div>
    </div>
  );
};

const Form = ({
  index,
  id,
  subForm,
  orgPath,
}: {
  index: number;
  id: string;
  subForm: ArrayInputProps['subform'];
  orgPath: string;
}) => {
  return (
    <>
      {subForm.map((control) => {
        const path = `${orgPath}[${index}].${control.path}`;
        const _id = `${id}-${control.path}-${index}`;
        const newControl = { ...control, path, id };
        return (
          <EntityFormControl control={newControl} entityId={id} key={_id} />
        );
      })}
    </>
  );
};

const FormWrapper = ({
  children,
  onDelete,
}: {
  value: unknown[];
  children: React.ReactNode;
  onDelete: () => void;
}) => {
  return (
    <div className="flex w-full flex-col gap-2 border border-gray-300 p-2">
      {children}
      <div>
        <Button
          className="text-center"
          size="sm"
          variant="destructive"
          onClick={onDelete}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default InspectorArrayInput;
