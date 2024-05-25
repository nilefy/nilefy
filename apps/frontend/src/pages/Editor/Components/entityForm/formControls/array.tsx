import { Button } from '@/components/ui/button';
import { ArrayInputProps } from '@/lib/Editor/interface';
import { useContext } from 'react';
import { EntityFormControl, EntityFormControlContext } from '..';
import { editorStore } from '@/lib/Editor/Models';
import { observer } from 'mobx-react-lite';

export const InspectorArrayInput = observer((props: ArrayInputProps) => {
  const { path, entityId } = useContext(EntityFormControlContext);
  const value = editorStore.getEntityById(entityId)?.getRawValue(path);
  const SubFormWrapper = observer(
    props.SubFormWrapper ?? DefaultSubFormWrapper,
  );
  const FormWrapper = observer(props.FormWrapper ?? DefaultFormWrapper);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col gap-2">
        {((value as Record<string, unknown>[]) || []).map(
          (subformItem, index) => {
            return (
              <SubFormWrapper
                key={index}
                value={subformItem}
                onDelete={() => {
                  const entity = editorStore.getEntityById(entityId);
                  entity?.removeElementFromArray(path, index);
                }}
              >
                <Form
                  FormWrapper={FormWrapper}
                  subForm={props.subform}
                  index={index}
                  id={entityId}
                  orgPath={path}
                />
              </SubFormWrapper>
            );
          },
        )}
      </div>
      <div>
        <Button
          size="sm"
          onClick={() => {
            const entity = editorStore.getEntityById(entityId);
            entity?.pushIntoArray(path, props.newItemDefaultValue);
          }}
        >
          {props.addButtonText ?? 'Add'}
        </Button>
      </div>
    </div>
  );
});

const Form = observer(
  ({
    index,
    id,
    subForm,
    orgPath,
    FormWrapper,
  }: {
    index: number;
    id: string;
    subForm: ArrayInputProps['subform'];
    orgPath: string;
    FormWrapper: React.FC<{ children: React.ReactNode }>;
  }) => {
    return (
      <FormWrapper>
        {subForm.map((control) => {
          const path = `${orgPath}[${index}].${control.path}`;
          const _id = `${id}-${control.path}-${index}`;
          const newControl = { ...control, path, id };
          return (
            <EntityFormControl control={newControl} entityId={id} key={_id} />
          );
        })}
      </FormWrapper>
    );
  },
);

const DefaultSubFormWrapper = observer(
  ({
    children,
    onDelete,
  }: {
    value: Record<string, unknown>;
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
  },
);
const DefaultFormWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
export default InspectorArrayInput;
