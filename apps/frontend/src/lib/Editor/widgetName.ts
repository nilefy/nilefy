let entityOrder: Record<string, number> = {};

export function getNewEntityName(type: string): string {
  return `${type}${entityOrder[type]}`;
}

export function getNewEntityOrder(type: string): number {
  entityOrder[type] = (entityOrder[type] ?? 0) + 1;
  return entityOrder[type];
}

/**
 * init map when start a new app, from old existing data
 */
export function seedOrderMap(entities: { type: string; order: number }[]) {
  entityOrder = {};
  entities.forEach(({ type, order }) => {
    entityOrder[type] = Math.max(entityOrder[type] ?? 0, order);
  });
}
