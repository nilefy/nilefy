import { WebloomButtonWidget } from './WebloomWidgets/Button';
import { WebloomContainerWidget } from './WebloomWidgets/Container';
import { WebloomInputWidget } from './WebloomWidgets/Input';
import { WebloomTextWidget } from './WebloomWidgets/Text';

export const WebloomWidgets = {
  WebloomButton: WebloomButtonWidget,
  WebloomContainer: WebloomContainerWidget,
  WebloomInput: WebloomInputWidget,
  WebloomText: WebloomTextWidget,
} as const;

export type WidgetTypes = keyof typeof WebloomWidgets;
