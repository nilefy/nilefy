import { FunctionComponent } from 'react';
import { EntityActionConfig } from './evaluation/interface';
import { WebloomWidget } from './Models/widget';
import { NewWidgePayload } from './Models/page';
import { LucideProps } from 'lucide-react';
import {
  BaseControlProps,
  EntityInspectorConfig as BaseEntityInspectorConfig,
  InlineCodeInputProps,
  InspectorColorProps,
  InspectorFormControlsTypes,
  InspectorInputProps,
  InspectorSelectProps,
} from '@nilefy/constants';
import { ExtendedIsHidden } from '@/pages/Editor/Components/entityForm';

export type BoundingRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};
export type ShadowElement = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type WebloomGridDimensions = {
  /**
   * columnNumber from left to right starting from 0 to NUMBER_OF_COLUMNS
   */
  col: number;
  /**
   * rowNumber from top to bottom starting from 0 to infinity
   */
  row: number;
  // this propert is exclusive for canvas nodes
  columnWidth?: number;
  // number of columns this node takes
  columnsCount: number;
  /**
   * number of rows this node takes
   */
  rowsCount: number;
};

export type WebloomPixelDimensions = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayoutMode = 'auto' | 'fixed' | 'limited';
export interface LayoutConfig {
  minColumns?: number;
  minRows?: number;
  colsCount: number;
  rowsCount: number;
  layoutMode?: LayoutMode;
}
export type ResizeDirection = 'Horizontal' | 'Vertical' | 'Both';
export interface WidgetConfig {
  icon: FunctionComponent<LucideProps>;
  name: string;
  layoutConfig: LayoutConfig;
  isCanvas?: boolean;
  resizingDirection: ResizeDirection;
  widgetActions?: EntityActionConfig<WebloomWidget>;
}

export type PrimitiveWidget = {
  isComposed: false;
};

export type ComposedWidget = {
  isComposed: true;
};

export type PublicApiItem = {
  /**
   * @description this will be placed in jsdoc of the generated type
   */
  description?: string;
} & (DynamicPublicApiItem | StaticPublicApiItem | FunctionPublicApiItem);

export type DynamicPublicApiItem = {
  /**
   * used to generate type at runtime, example: jsquery.data <--- data is only known at runtime so we need to generate the type at runtime
   */
  type: 'dynamic';
};

export type StaticPublicApiItem = {
  type: 'static';
  typeSignature: string;
};

export type FunctionArgs =
  | {
      optional?: boolean;
      name: string;
      type: string;
    }[]
  | string;

export type FunctionType = {
  args?: FunctionArgs;
  returns?: string;
};

export type FunctionPublicApiItem = {
  type: 'function';
} & FunctionType;
export type PublicApi = Record<string, PublicApiItem>;
type EntityInspectorConfig<
  TWidgetProps extends Record<string, unknown> = Record<string, unknown>,
> = BaseEntityInspectorConfig<TWidgetProps, ExtendedIsHidden>;
export type Widget<TWidgetProps extends Record<string, unknown>> = {
  config: WidgetConfig;
  initialProps: TWidgetProps;
  publicAPI?: PublicApi;
  metaProps?: Set<string>;
  inspectorConfig: EntityInspectorConfig<TWidgetProps>;
  blueprint?: {
    children: (Omit<NewWidgePayload, 'parentId' | 'id'> & {
      onAttach?: (widget: WebloomWidget) => void;
    })[];
  };
  component: React.ElementType;
};
type SelectOptions = {
  value: string;
  label: string;
};

// inspector types
export type {
  BaseControlProps,
  InspectorInputProps,
  InspectorSelectProps,
  InspectorFormControlsTypes,
  InlineCodeInputProps,
  InspectorColorProps,
  SelectOptions,
  EntityInspectorConfig,
};

export type EntityTypes = 'query' | 'widget' | 'globals' | 'jsQuery';

export type EntityPathErrors = {
  /**
   * key is the path of the property
   */
  evaluationValidationErrors?: string[];
  runtimeErrors?: string[];
};
/**
 * key is the entityId
 */
export type EntityErrorsRecord = Record<
  string,
  Record<string, EntityPathErrors>
>;
export const WIDGET_SECTIONS = {
  SCROLL_AREA: 'SCROLL_AREA',
  CANVAS: 'CANVAS',
  RESIZER: 'RESIZER',
} as const;
export type selectOptions = {
  value: string;
  label: string;
};

/**
 * @description These are the values that are passed to the widget when it is first created, they differ from
 * default values. You can write code instead of static values here as well. Just make sure to add the paths of
 * those values to the evaluablePaths array in the widget.
 */
export type InitialProps<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] | string;
};
