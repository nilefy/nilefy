import { InputProps } from '@/components/ui/input';
import { ReactNode } from 'react';
import { WebloomPage } from './Models/page';

type BaseControlProps = {
  id: string;
  label: string;
  defaultValue?: string | number | boolean;
  value?: string | number | boolean;
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

type InspectorListProps = {
  value?: unknown[];
};

type InspectorCheckboxProps = {
  //  label: string;
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
  list: InspectorListProps;
  checkbox: InspectorCheckboxProps;
  inlineCodeInput: InlineCodeInputProps;
};

type MappedTypeToArray<T> = T extends { [K in keyof T]: infer U } ? U[] : never;
type WidgetInspectorConfig<TProps> = {
  sectionName: string;
  children: MappedTypeToArray<{
    [key in keyof TProps]: {
      [key2 in InspectorFormControls]: {
        type: key2;
        key: key;
        options: FormControlOptions[key2];
        label: string;
      } & BaseControlProps;
    }[InspectorFormControls];
  }>;
}[];

type InspectorFormControls = keyof FormControlOptions;

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
type bluePrintType = Omit<
  Parameters<InstanceType<typeof WebloomPage>['addWidget']>[0],
  'parentId'
>;
export type ResizeDirection = 'Horizontal' | 'Vertical' | 'Both';
export interface WidgetConfig {
  icon: ReactNode;
  name: string;
  layoutConfig: LayoutConfig;
  isCanvas?: boolean;
  resizingDirection: ResizeDirection;
  bluePrint?: bluePrintType[];
}
// key is the id of the node and the array are keys of props
/**
 * @example {"nodeId" : {"propName": ["dependancy1", "dependancy2"]}}
 */
export type EntityDependancy = Record<string, Record<string, Set<string>>>;
// export type WebloomNode = {
//   id: string;
//
//   dom: HTMLElement | null;
//   nodes: string[];
//   parent: string;
//   isCanvas?: boolean;
//   props: Record<string, unknown>;
//   dynamicProps: Record<string, unknown>;
//   dependants: EntityDependancy;
//   dependancies: EntityDependancy;
//   toBeEvaluatedProps: Set<string>;
//   type: WidgetTypes;
// } & WebloomGridDimensions;

export type Widget<WidgetProps> = {
  component: React.ElementType;
  config: WidgetConfig;
  defaultProps: WidgetProps;
  inspectorConfig: WidgetInspectorConfig<WidgetProps>;
};

// inspector types
export type {
  BaseControlProps,
  InspectorInputProps,
  InspectorSelectProps,
  InspectorListProps,
  InspectorCheckboxProps,
  WidgetInspectorConfig,
  InspectorFormControls,
  InlineCodeInputProps,
  InspectorColorProps,
};
