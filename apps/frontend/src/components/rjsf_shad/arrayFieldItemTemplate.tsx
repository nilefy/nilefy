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

export enum ArrayFieldItemType {
  'EventHandlerItem' = 1,
}

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

/**
 * note it will fallback for default with undefined or if it didn't know the type
 */
function Item({
  itemType,
  itemValue,
  children,
}: {
  itemValue: any;
  children: ReactElement;
  itemType?: ArrayFieldItemType;
}) {
  switch (itemType) {
    case ArrayFieldItemType.EventHandlerItem: {
      return (
        <EventHandlerItemView event={itemValue}>
          {children}
        </EventHandlerItemView>
      );
    }
    default: {
      return <div className="h-fit w-full overflow-auto">{children}</div>;
    }
  }
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
    itemValue: unknown;
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
    itemValue: temp,
  } = props;
  const { CopyButton, MoveDownButton, MoveUpButton, RemoveButton } =
    registry.templates.ButtonTemplates;
  const itemValue = temp as WidgetsEventHandler[0];
  const customItemType = uiSchema?.['ui:options']?.['ui:itemType'] as
    | ArrayFieldItemType
    | undefined;

  return (
    <div className="flex h-full w-full items-center gap-2">
      <Item itemValue={itemValue} itemType={customItemType}>
        {children}
      </Item>
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
