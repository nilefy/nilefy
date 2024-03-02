let entityOrder: Record<string, number> = {};

export function getNewEntityName(type: string): string {
  entityOrder[type] = (entityOrder[type] ?? 0) + 1;
  return `${type}${entityOrder[type]}`;
}

/**
 * init map when start a new app, from old existing data
 */
export function seedOrderMap(entities: { type: string; name: string }[]) {
  entityOrder = {};
  entities.forEach(({ type, name }) => {
    const nameRe = new RegExp(`${type}\\d+`);
    let order = 0;
    if (nameRe.test(name)) {
      let pos = type.length;
      while (pos < name.length) {
        order *= 10;
        order += +name[pos++];
      }
    }
    entityOrder[type] = Math.max(entityOrder[type] ?? 0, order);
  });
}
