import { cn } from '@/lib/cn';
import {
  canExpand,
  descriptionId,
  FormContextType,
  getTemplate,
  getUiOptions,
  ObjectFieldTemplateProps,
  RJSFSchema,
  StrictRJSFSchema,
  titleId,
} from '@rjsf/utils';

export default function ObjectFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ObjectFieldTemplateProps<T, S, F>) {
  const {
    description,
    title,
    properties,
    required,
    disabled,
    readonly,
    uiSchema,
    idSchema,
    schema,
    formData,
    onAddClick,
    registry,
  } = props;
  const uiOptions = getUiOptions<T, S, F>(uiSchema);
  const TitleFieldTemplate = getTemplate<'TitleFieldTemplate', T, S, F>(
    'TitleFieldTemplate',
    registry,
    uiOptions,
  );
  const DescriptionFieldTemplate = getTemplate<
    'DescriptionFieldTemplate',
    T,
    S,
    F
  >('DescriptionFieldTemplate', registry, uiOptions);
  // Button templates are not overridden in the uiSchema
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  return (
    <>
      {title && (
        <TitleFieldTemplate
          id={titleId<T>(idSchema)}
          title={title}
          required={required}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      {description && (
        <DescriptionFieldTemplate
          id={descriptionId<T>(idSchema)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <div className={cn('flex mb-4', description ? 'gap-2' : 'gap-6')}>
        {properties.map((element, index) =>
          element.hidden ? (
            element.content
          ) : (
            <div key={`${idSchema.$id}-${element.name}-${index}`}>
              {element.content}
            </div>
          ),
        )}
        {canExpand<T, S, F>(schema, uiSchema, formData) && (
          <div className="justify-self-end">
            <AddButton
              className="object-property-expand"
              onClick={onAddClick(schema)}
              disabled={disabled || readonly}
              uiSchema={uiSchema}
              registry={registry}
            />
          </div>
        )}
      </div>
    </>
  );
}
