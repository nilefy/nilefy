export let entityNames: Record<string, number> = {};

export function getNewEntityName(type: string): string {
  entityNames[type] = (entityNames[type] ?? 0) + 1;
  return `${type}${entityNames[type]}`;
}

/**
 * init map when start a new app, from old existing data
 */
export function seedNameMap(entiteTypes: string[]) {
  entityNames = {};
  entiteTypes.forEach((type) => {
    entityNames[type] = (entityNames[type] ?? 0) + 1;
  });
}
