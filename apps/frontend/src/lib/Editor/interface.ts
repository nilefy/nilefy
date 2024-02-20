import { InputProps } from '@/components/ui/input';
import { ReactNode } from 'react';
import { JsonSchema7Type } from 'zod-to-json-schema';

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
  FormControlType extends InspectorFormControlsTypes,
  TProps extends Record<string, unknown> = Record<string, unknown>,
  Key extends keyof TProps = keyof TProps,
> = {
  type: FormControlType;
  path: Key;
  options: FormControlOptions[FormControlType];
  hidden?(props: TProps): boolean;
  deps?: keyof TProps[];
  validation?: JsonSchema7Type;
} & BaseControlProps;
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

export interface LayoutConfig {
  minColumns?: number;
  minRows?: number;
  colsCount: number;
  rowsCount: number;
}
export type ResizeDirection = 'Horizontal' | 'Vertical' | 'Both';
export interface WidgetConfig {
  icon: ReactNode;
  name: string;
  layoutConfig: LayoutConfig;
  isCanvas?: boolean;
  resizingDirection: ResizeDirection;
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

export type EntityTypes = 'query' | 'widget';

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
