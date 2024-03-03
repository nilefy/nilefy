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
import { CSSProperties, ReactElement } from 'react';
import { Copy, MoreVertical, Trash } from 'lucide-react';
import z from 'zod';

export enum ArrayFieldItemType {
  'EventHandlerItem' = 1,
  'ChartItem' = 2,
}

type EventHandlerItemUtilsProps = {
  onCopyCB: () => void;
  onDeleteCB: () => void;
};

export const chartDatasets = z.array(
  z.object({
    name: z.string().default(''),
    yValue: z.string(),
    /**
     *@link https://docs.retool.com/apps/web/guides/components/charts#transformation-types
     * @description none
     * @description count	Returns the quantity of items for each group.
     * @description sum	Returns the summation of all numeric values.
     * @description avg	Returns the average of all numeric values.
     * @description median	Returns the median of all numeric values.
     * @description mode	Returns the mode of all numeric values.
     * @description rms	Returns the rms of all numeric values.
     * @description stddev	Returns the standard deviation of all numeric values.
     * @description min	Returns the minimum numeric value for each group.
     * @description max	Returns the maximum numeric value for each group.
     * @description first	Returns the first numeric value for each group.
     * @description last	Returns the last numeric value for each group.
     */
    aggMethod: z.enum([
      'none',
      'count',
      'sum',
      'avg',
      'median',
      // 'mode',
      'rms',
      'stddev',
      'min',
      'max',
      'first',
      'last',
    ]),
    chartType: z.enum(['bar', 'line', 'scatter']),
    // TODO: make it auto generated from existing datasets
    color: z.string(),
  }),
);
type ChartDatasetsT = z.infer<typeof chartDatasets>;

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

function ChartDatasetItemView({
  dataset,
  children,
  onDeleteCB,
  onCopyCB,
}: {
  dataset: ChartDatasetsT[0];
  children: ReactElement;
} & EventHandlerItemUtilsProps) {
  return (
    <DropdownMenu>
      <div className="flex h-full w-full justify-between rounded-2xl  border-2 p-3">
        <DropdownMenuTrigger className="h-full w-full ">
          <p className="line-clamp-3 flex min-h-full w-full min-w-full items-center gap-3 ">
            <span
              className="h-9 w-9 rounded-full"
              style={{ backgroundColor: dataset.color }}
            ></span>
            <span className="w-fit rounded-2xl bg-secondary p-3">
              {dataset.name ?? 'unconfigured'}
            </span>
            <span className="">{dataset.aggMethod ?? 'unconfigured'}</span>
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
    case ArrayFieldItemType.ChartItem: {
      return (
        <ChartDatasetItemView
          dataset={itemValue}
          onDeleteCB={onDeleteCB}
          onCopyCB={onCopyCB}
        >
          {children}
        </ChartDatasetItemView>
      );
    }
    default: {
      return <div className="h-fit w-full ">{children}</div>;
    }
  }
}

/** The `ArrayFieldItemTemplate` component is the template used to render an items of an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
 * set custom type with: uiSchema.['ui:options'].['ui:itemType']
 * @example
 *
      datasets: {
        items: {
          'ui:options': {
            'ui:itemType': ArrayFieldItemType.EventHandlerItem,
          },
          name: {
            'ui:widget': 'inlineCodeInput',
          },
        },
      },
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

  const btnStyle: CSSProperties = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold',
    minWidth: 0,
  };

  return (
    <div className="flex items-center">
      <div className="flex-1 p-4">
        <Item
          itemValue={itemValue}
          itemType={customItemType}
          onDeleteCB={onDropIndexClick(index)}
          onCopyCB={onCopyIndexClick(index)}
        >
          {children}
        </Item>
      </div>

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
