import { WebloomNode } from '@/lib/Editor/interface';

let widgetNames: Record<string, number> = {};

export function getNewWidgetName(type: string): string {
  widgetNames[type] = (widgetNames[type] ?? 0) + 1;
  return `${type}${widgetNames[type]}`;
}

/**
 * init map when start a new app, from old existing data
 */
export function seedNameMap(nodes: WebloomNode[]) {
  widgetNames = {};
  nodes.forEach(({ type }) => {
    widgetNames[type] = (widgetNames[type] ?? 0) + 1;
  });
}
