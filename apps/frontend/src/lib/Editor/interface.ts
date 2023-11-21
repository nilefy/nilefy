import { WidgetTypes } from '@/pages/Editor/Components';
import { ReactNode } from 'react';

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

//----
// Widget Definitions

export interface LayoutConfig {
  minColumns?: number;
  minRows?: number;
  colsCount: number;
  rowsCount: number;
}

export interface BaseWidgetConfig {
  icon: ReactNode;
  name: string;
  layoutConfig: LayoutConfig;
  isCanvas?: boolean;
  type: WidgetTypes;
}
export type WidgetConfig<T extends Record<string, unknown>> = BaseWidgetConfig &
  T;

export type WebloomNode = {
  id: string;
  name: string;

  dom: HTMLElement | null;
  nodes: string[];
  parent: string;
  isCanvas?: boolean;
  widget: {
    widgetConfig: WidgetConfig<Record<string, unknown>>;
    props: Record<string, unknown>;
  };
} & WebloomGridDimensions;

//----
//Inspector Form control definitions

// export type FormControlOptions = {
//     input: InspectorInputProps;
//     select: InspectorSelectProps;
//   };
//   export type InspectorFormControls = keyof FormControlOptions;
