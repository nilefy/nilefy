import {
  ArrayFieldTemplateItemType,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

/** The `ArrayFieldItemTemplate` component is the template used to render an items of an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
 */
export default function ArrayFieldItemTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTemplateItemType<T, S, F>) {
  const {
    children,
    disabled,
    hasToolbar,
    hasCopy,
    hasMoveDown,
    hasMoveUp,
    hasRemove,
    index,
    onCopyIndexClick,
    onDropIndexClick,
    onReorderClick,
    readonly,
    uiSchema,
    registry,
  } = props;
  const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } =
    registry.templates.ButtonTemplates;
  return (
    <div className="flex w-full items-center gap-2">
      <div className="h-fit w-full overflow-auto">{children}</div>
      {hasToolbar && (
        <div className="ml-auto flex items-center gap-3">
          {(hasMoveUp || hasMoveDown) && (
            <MoveUpButton
              disabled={disabled || readonly || !hasMoveUp}
              onClick={onReorderClick(index, index - 1)}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {(hasMoveUp || hasMoveDown) && (
            <MoveDownButton
              disabled={disabled || readonly || !hasMoveDown}
              onClick={onReorderClick(index, index + 1)}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {hasCopy && (
            <CopyButton
              disabled={disabled || readonly}
              onClick={onCopyIndexClick(index)}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
          {hasRemove && (
            <RemoveButton
              disabled={disabled || readonly}
              onClick={onDropIndexClick(index)}
              uiSchema={uiSchema}
              registry={registry}
            />
          )}
        </div>
      )}
    </div>
  );
}
