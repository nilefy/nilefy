import { WebloomNode } from '@/lib/Editor/interface';
import { WebloomWidgets, WidgetTypes } from '@/pages/Editor/Components';

let widgetNames: Record<
  (typeof WebloomWidgets)[WidgetTypes]['config']['name'],
  number
> = {};

export function getNewWidgetName(type: WidgetTypes): string {
  const name = WebloomWidgets[type].config.name;
  widgetNames[name] = (widgetNames[name] ?? 0) + 1;
  return `${name}${widgetNames[name]}`;
}

/**
 * init map when start a new app, from old existing data
 */
export function seedNameMap(nodes: WebloomNode[]) {
  widgetNames = {};
  nodes.forEach(({ type }) => {
    const name = WebloomWidgets[type].config.name;
    widgetNames[name] = (widgetNames[name] ?? 0) + 1;
  });
}
