import { InputProps } from '@/components/ui/input';
import {
  Component,
  ExoticComponent,
  FunctionComponent,
  ReactElement,
  ReactNode,
} from 'react';
import { JsonSchema7Type } from 'zod-to-json-schema';
import { EntityActionConfig } from './evaluation/interface';
import { WebloomWidget } from './Models/widget';
import { NewWidgePayload } from './Models/page';
import { LucideProps } from 'lucide-react';

type BaseControlProps = {
  label: string;
};

// each widget props
type InspectorInputProps = Partial<
  Pick<InputProps, 'type' | 'placeholder' | 'max' | 'min'>
>;

type InspectorStaticSelectProps = {
  items: { label: string; value: string }[];
};
type InspectorDynamicSelectProps = {
  path: string;
  convertToOptions: (value: unknown) => { label: string; value: string }[];
};
type InspectorSelectProps = {
  placeholder?: string;
} & (InspectorStaticSelectProps | InspectorDynamicSelectProps);

type InspectorColorProps = {
  color: string;
};

type InspectorEvents = Record<string, never>;

type InspectorDatePickerProps = {
  date: Date;
};
export type ArrayInputProps<T = any> = {
  subform: FormControl[];
  SubFormWrapper?: React.FC<{
    onDelete: () => void;
    children: ReactNode;
    value: T;
  }>;
  FormWrapper?: React.FC<{ children: ReactNode }>;
  newItemDefaultValue: Record<string, unknown>;
  addButtonText?: string;
};

// config panel types
type FormControlOptions = {
  input: InspectorInputProps;
  select: InspectorSelectProps;
  color: InspectorColorProps;
  event: InspectorEvents;
  sqlEditor: {
    placeholder?: string;
  };
  list: undefined;
  checkbox: undefined;
  inlineCodeInput: InlineCodeInputProps;
  chartDatasets: undefined;
  datePicker: InspectorDatePickerProps;
  array: ArrayInputProps;
  keyValue: undefined;
  codeInput: undefined;
};

type MappedTypeToArray<T> = T extends { [K in keyof T]: infer U } ? U[] : never;
type EntityInspectorConfig<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  sectionName: string;
  hidden?: (props: TProps) => boolean;
  deps?: TProps[];
  children: MappedTypeToArray<{
    [key in keyof TProps]: {
      [key2 in InspectorFormControlsTypes]: FormControl<key2, TProps, key>;
    }[InspectorFormControlsTypes];
  }>;
}[];

export type FormControl<
  FormControlType extends
    InspectorFormControlsTypes = InspectorFormControlsTypes,
  TProps extends Record<string, unknown> = Record<string, unknown>,
  Key extends keyof TProps = keyof TProps,
> = {
  type: FormControlType;
  isEvent?: boolean;
  path: Key;

  hidden?(props: TProps): boolean;
  validation?: JsonSchema7Type;
} & BaseControlProps &
  ConditionalOptionalFormControlOptions<FormControlOptions[FormControlType]>;

export type ConditionalOptionalFormControlOptions<T> = T extends undefined
  ? object
  : {
      options: T;
    };

type InspectorFormControlsTypes = keyof FormControlOptions;

type InlineCodeInputProps = {
  placeholder?: string;
};
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
  EntityInspectorConfig,
  InspectorFormControlsTypes,
  InlineCodeInputProps,
  InspectorColorProps,
  SelectOptions,
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
