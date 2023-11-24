import { WebloomButtonWidget } from './WebloomWidgets/Button';
import { WebloomContainerWidget } from './WebloomWidgets/Container';
import { WebloomInputWidget } from './WebloomWidgets/Input';

export type WebloomComponentsRules = {
  minColumnCount: number;
  minRowCount: number;
  initialRowCount: number;
  initialColumnCount: number;
};

export const WebloomWidgets = {
  WebloomButton: WebloomButtonWidget,
  WebloomContainer: WebloomContainerWidget,
  WebloomInput: WebloomInputWidget,
} as const;

export type WidgetTypes = keyof typeof WebloomWidgets;
