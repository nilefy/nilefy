import { WebloomWidget } from '@/lib/Editor/Models/widget';

export type Point = { x: number; y: number };

export type WidgetSnapshot = Omit<
  ConstructorParameters<typeof WebloomWidget>[0],
  'page'
> & {
  pageId: string;
};
