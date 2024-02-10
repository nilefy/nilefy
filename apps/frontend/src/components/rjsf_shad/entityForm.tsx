import { observer } from 'mobx-react-lite';
import { RJSFShadcn } from '.';
import validator from '@rjsf/validator-ajv8';
import { forwardRef, useCallback } from 'react';
import Form, { FormProps } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import { get } from 'lodash';
import { editorStore } from '@/lib/Editor/Models';
import invariant from 'invariant';
export type EntityFormProps = Omit<
  FormProps<any, RJSFSchema, any>,
  | 'idPrefix'
  | 'schema'
  | 'uiSchema'
  | 'formData'
  | 'validator'
  | 'extraErrors'
  | 'noValidate'
  | 'idSeparator'
> & {
  entityId: string;
};

const EntityForm = forwardRef<Form<any, RJSFSchema, any>, EntityFormProps>(
  function EntityForm(props, ref) {
    const entity = editorStore.getEntityById(props.entityId);
    invariant(
      entity,
      `Entity with id ${props.entityId} not found while rendering EntityForm`,
    );
    invariant(
      entity.schema.dataSchema,
      `Entity with id ${props.entityId} has no schema while rendering EntityForm`,
    );

    const onEntityChange = useCallback<
      NonNullable<FormProps<any, RJSFSchema, any>['onChange']>
    >(
      (form, id) => {
        if (!props.onChange) {
          if (!id) {
            return;
          }
          const path = id!.split('.').slice(1).join('.');
          entity.setValue(path, get(form.formData, path));
        } else {
          props.onChange(form, id);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [entity, props.onChange],
    );

    return (
      <RJSFShadcn
        ref={ref}
        noValidate
        // despite having explicitly set noValidate, the following line is necessary because rjsf has not yet set the validator prop as optional
        validator={validator}
        idSeparator="."
        uiSchema={entity.schema.uiSchema}
        schema={entity.schema.dataSchema}
        formData={entity.prefixedRawValues}
        focusOnFirstError={false}
        // These are not really extra, they are the actual errors since we disabled the default validation these are the only errors we will get
        // The things rjsf made me do :(
        extraErrors={entity.validationErrors}
        showErrorList={false}
        onChange={onEntityChange}
      />
    );
  },
);

export default observer(EntityForm);
