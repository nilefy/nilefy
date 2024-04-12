import { keys } from 'lodash';
import { defaultLibraries } from './libraries';

let entityOrder: Record<string, Set<number>> = {};

export function getNewEntityName(
  type: string,
  sideEffect: boolean = true,
): string {
  if (!entityOrder[type]) {
    entityOrder[type] = new Set();
  }
  const order =
    (entityOrder[type].size ? Math.max(...entityOrder[type]) : 0) + 1;
  if (!sideEffect) return `${type}${order}`;
  entityOrder[type].add(order);
  return `${type}${order}`;
}

/**
 * init map when start a new app, from old existing data
 */
export function seedOrderMap(entities: { type: string; name: string }[]) {
  entities = [
    ...keys(defaultLibraries).map((i) => ({ name: i, type: 'library' })),
    ...entities,
  ];
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
    if (!entityOrder[type]) {
      entityOrder[type] = new Set();
    }
    entityOrder[type].add(order);
  });
}

export function updateOrderMap(
  entities: { type: string; name: string }[],
  deleted: boolean,
) {
  entities.forEach(({ type, name }) => {
    const nameRe = new RegExp(`${type}\\d+`);

    if (!nameRe.test(name)) return;

    let order = 0;
    if (nameRe.test(name)) {
      let pos = type.length;
      while (pos < name.length) {
        order *= 10;
        order += +name[pos++];
      }
    }

    if (deleted) {
      entityOrder[type].delete(order);
    } else {
      entityOrder[type].add(order);
    }
  });
}
