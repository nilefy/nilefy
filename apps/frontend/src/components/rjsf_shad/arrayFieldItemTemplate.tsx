import {
  ArrayFieldTemplateItemType,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { WidgetsEventHandler } from './eventHandler';
import { ReactElement } from 'react';
import { Copy, MoreVertical, Trash } from 'lucide-react';

export enum ArrayFieldItemType {
  'EventHandlerItem' = 1,
}

type EventHandlerItemUtilsProps = {
  onCopyCB: () => void;
  onDeleteCB: () => void;
};

function EventHandlerItemUtils({
  onCopyCB,
  onDeleteCB,
}: EventHandlerItemUtilsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/*
          CLONE
          */}
        <DropdownMenuItem
          onClick={() => {
            console.log('here');
            onCopyCB();
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          <span>Duplicate</span>
        </DropdownMenuItem>

        {/*DELETE*/}
        <DropdownMenuItem className="text-red-500" onClick={onDeleteCB}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EventHandlerItemView({
  event,
  children,
  onDeleteCB,
  onCopyCB,
}: {
  event: WidgetsEventHandler[0];
  children: ReactElement;
} & EventHandlerItemUtilsProps) {
  return (
    <DropdownMenu>
      <div className="flex h-full w-full justify-between rounded-2xl  border-2 p-3">
        <DropdownMenuTrigger className="h-full w-full ">
          <p className="line-clamp-3 flex min-h-full w-full min-w-full items-center gap-3 ">
            <span className="w-fit rounded-2xl bg-secondary p-3">
              {event.type ?? 'unconfigured'}
            </span>
            <span className="">{event.config.type ?? 'unconfigured'}</span>
          </p>
        </DropdownMenuTrigger>
        <EventHandlerItemUtils onCopyCB={onCopyCB} onDeleteCB={onDeleteCB} />
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
  onDeleteCB,
  onCopyCB,
}: {
  itemValue: any;
  children: ReactElement;
  itemType?: ArrayFieldItemType;
} & EventHandlerItemUtilsProps) {
  switch (itemType) {
    case ArrayFieldItemType.EventHandlerItem: {
      return (
        <EventHandlerItemView
          event={itemValue}
          onDeleteCB={onDeleteCB}
          onCopyCB={onCopyCB}
        >
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
      <Item
        itemValue={itemValue}
        itemType={customItemType}
        onDeleteCB={onDropIndexClick(index)}
        onCopyCB={onCopyIndexClick(index)}
      >
        {children}
      </Item>

      {hasToolbar && customItemType === undefined && (
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
