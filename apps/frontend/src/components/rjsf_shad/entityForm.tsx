import { observer } from 'mobx-react-lite';
import { RJSFShadcn } from '.';
import validator from '@rjsf/validator-ajv8';
import { forwardRef, useCallback } from 'react';
import Form, { FormProps } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import { get } from 'lodash';
import { editorStore } from '@/lib/Editor/Models';
import invariant from 'invariant';
import { WebloomWidget } from '@/lib/Editor/Models/widget';
import { commandManager } from '@/Actions/CommandManager';
import { ChangePropAction } from '@/Actions/Editor/changeProps';

export type EntityFormContextT = {
  entityId: string;
};

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
        console.log('DEBUGPRINT[6]: entityForm.tsx:43: id=', id);
        if (!props.onChange) {
          if (!id) {
            return;
          }
          // function to get complete prop path from rjsf form control id
          const path = id!.split('.').slice(1).join('.');
          console.log('DEBUGPRINT[7]: entityForm.tsx:50: path=', path);
          const newValue = get(form.formData, path);
          if (entity instanceof WebloomWidget) {
            // just to integrate the ws in
            commandManager.executeCommand(
              new ChangePropAction(props.entityId, path, newValue),
            );
          } else {
            entity.setValue(path, newValue);
          }
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
        formContext={
          {
            entityId: props.entityId,
          } satisfies EntityFormContextT
        }
        idSeparator="."
        uiSchema={entity.schema.uiSchema}
        schema={entity.schema.dataSchema}
        formData={entity.prefixedRawValues}
        focusOnFirstError={false}
        // TODO: if you don't want this create validator class that all it do is pull errors from the entity class, and i would prefer this for approach to come over this //"these are non-blocking errors, meaning that you can
        //still submit the form when these are the only errors displayed to the user."
        // These are not really extra, they are the actual errors since we disabled the default validation these are the only errors we will get
        // The things rjsf made me do :(
        extraErrors={entity.validationErrors}
        showErrorList={false}
        onChange={onEntityChange}
        {...props}
      />
    );
  },
);

export default observer(EntityForm);
