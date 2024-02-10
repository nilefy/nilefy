import { observer } from 'mobx-react-lite';
import { RJSFShadcn } from '.';
import validator from '@rjsf/validator-ajv8';
import { forwardRef, useMemo } from 'react';
import Form, { FormProps } from '@rjsf/core';
import { RJSFSchema } from '@rjsf/utils';
import { merge } from 'lodash';
import { editorStore } from '@/lib/Editor/Models';
export type EntityFormProps = Omit<
  FormProps<any, RJSFSchema, any>,
  'idPrefix'
> & {
  entityId: string;
  nestedPath?: string;
};

const EntityForm = forwardRef<Form<any, RJSFSchema, any>, EntityFormProps>(
  function EntityForm(props, ref) {
    const uiSchema = useMemo(() => {
      const additionalUISchema = {
        'ui:options': {
          submitButtonOptions: {
            norender: true,
          },
        },
      };

      const schemaWithSubmitButtonDisabled = merge(
        {},
        props.uiSchema,
        additionalUISchema,
      );
      return schemaWithSubmitButtonDisabled;
    }, [props.uiSchema]);
    const entity = editorStore.getEntityById(props.entityId);
    if (!entity) {
      throw new Error(
        `Entity with id ${props.entityId} not found! while rendering EntityForm component.`,
      );
    }
    return (
      <RJSFShadcn
        ref={ref}
        noValidate
        validator={validator}
        idSeparator="."
        uiSchema={uiSchema}
        schema={props.schema}
        idPrefix={`${props.entityId}.${props.nestedPath || ''}`}
        extraErrors={entity.validationErrors}
      />
    );
  },
);

export default observer(EntityForm);
