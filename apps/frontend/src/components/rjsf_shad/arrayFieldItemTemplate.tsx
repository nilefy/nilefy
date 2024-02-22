import {
  ArrayFieldTemplateItemType,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { WidgetsEventHandler } from './eventHandler';
import { ReactElement } from 'react';

function EventHandlerItemView({
  event,
  children,
}: {
  event: WidgetsEventHandler[0];
  children: ReactElement;
}) {
  return (
    <DropdownMenu>
      <div className="flex h-full w-full justify-between">
        <DropdownMenuTrigger className="h-full w-full">
          <p className="flex min-h-full w-full min-w-full gap-3 border-black">
            {/*TODO: edit span className*/}
            <span className="">{event.type}</span>
            <span className="">{event.config.type}</span>
          </p>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent side="left" className="space-y-4 p-4">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The `ArrayFieldItemTemplate` component is the template used to render an items of an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
 */
export default function ArrayFieldItemTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(
  props: ArrayFieldTemplateItemType<T, S, F> & {
    itemValue: WidgetsEventHandler[0];
  },
) {
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
    itemValue,
  } = props;
  const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } =
    registry.templates.ButtonTemplates;
  return (
    <div className="flex h-full w-full items-center gap-2">
      {/* <div className="h-fit w-full overflow-auto">{children}</div> */}
      <EventHandlerItemView event={itemValue}>{children}</EventHandlerItemView>
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
