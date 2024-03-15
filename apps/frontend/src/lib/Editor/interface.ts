import { InputProps } from '@/components/ui/input';
import { ReactNode } from 'react';
import { JsonSchema7Type } from 'zod-to-json-schema';
import { EntityActionConfig } from './evaluation/interface';
import { WebloomWidget } from './Models/widget';

type BaseControlProps = {
  label: string;
};

// each widget props
type InspectorInputProps = Partial<
  Pick<InputProps, 'type' | 'placeholder' | 'max' | 'min'>
>;

type InspectorSelectProps = {
  items: { label: string; value: string }[];
  placeholder?: string;
};

type InspectorColorProps = {
  color: string;
};

type InspectorEvents = Record<string, never>;

type InspectorDatePickerProps = {
  date: Date;
};
// config panel types
type FormControlOptions = {
  input: InspectorInputProps;
  select: InspectorSelectProps;
  color: InspectorColorProps;
  event: InspectorEvents;
  sqlEditor: {
    value?: string;
    placeholder?: string;
  };
  list: undefined;
  checkbox: undefined;
  inlineCodeInput: InlineCodeInputProps;
  heightMode: {
    label: string;
  };
  datePicker: InspectorDatePickerProps;
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
  label: string;
  placeholder?: string;
  value?: string;
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
  icon: ReactNode;
  name: string;
  layoutConfig: LayoutConfig;
  isCanvas?: boolean;
  resizingDirection: ResizeDirection;
  widgetActions?: EntityActionConfig<WebloomWidget>;
}

export type Widget<WidgetProps extends Record<string, unknown>> = {
  component: React.ElementType;
  config: WidgetConfig;
  defaultProps: WidgetProps;
  publicAPI?: Set<string>;
  inspectorConfig: EntityInspectorConfig<WidgetProps>;
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
};

export type EntityTypes = 'query' | 'widget' | 'globals';

export type EntityPathErrors = {
  /**
   * key is the path of the property
   */
  validationErrors?: string[];
  evaluationErrors?: string[];
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
