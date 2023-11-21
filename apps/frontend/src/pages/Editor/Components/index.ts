import {
  WebloomButton,
  WebloomButtonConfig,
  WebloomButtonInspectorConfig,
} from './WebloomWidgets/Button';
import {
  WebloomContainer,
  WebloomContainerConfig,
  WebloomContainerInspectorConfig,
} from './WebloomWidgets/Container';

export type WebloomComponentsRules = {
  minColumnCount: number;
  minRowCount: number;
  initialRowCount: number;
  initialColumnCount: number;
};

export const WebloomWidgets = {
  WebloomButton: {
    component: WebloomButton,
    config: WebloomButtonConfig,
    inspectorConfig: WebloomButtonInspectorConfig,
  },
  WebloomContainer: {
    component: WebloomContainer,
    config: WebloomContainerConfig,
    inspectorConfig: WebloomContainerInspectorConfig,
  },
} as const;

export type WidgetTypes = keyof typeof WebloomWidgets;
export const getWidgetType = (type: WidgetTypes) => WebloomWidgets[type];
