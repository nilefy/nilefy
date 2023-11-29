import { WidgetTypes } from '@/pages/Editor/Components';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
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

export type WebloomNode = {
  id: string;
  name: string;

  dom: HTMLElement | null;
  nodes: string[];
  parent: string;
  isCanvas?: boolean;
  props: Record<string, unknown>;
  type: WidgetTypes;
} & WebloomGridDimensions;

export type Widget<WidgetProps> = {
  component: React.FC<WidgetProps>;
  config: WidgetConfig;
  defaultProps: WidgetProps;
  inspectorConfig: WidgetInspectorConfig<WidgetProps>;
};
