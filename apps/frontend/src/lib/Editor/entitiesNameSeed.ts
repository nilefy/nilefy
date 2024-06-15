import { keys } from 'lodash';
import { defaultLibraries } from './libraries';
import { editorStore } from './Models';
import { EntityTypes } from './interface';

let entityOrder: Record<string, Set<number> | Record<string, Set<number>>> = {};

export function getNewEntityName(
  type: string,
  pageId?: string,
  sideEffect: boolean = true,
): string {
  if (pageId) {
    if (!(entityOrder[type] as Record<string, Set<number>>)) {
      entityOrder[type] = {};
    }
    if (!(entityOrder[type] as Record<string, Set<number>>)[pageId]) {
      (entityOrder[type] as Record<string, Set<number>>)[pageId] = new Set();
    }
    const order =
      ((entityOrder[type] as Record<string, Set<number>>)[pageId].size
        ? Math.max(
            ...(entityOrder[type] as Record<string, Set<number>>)[pageId],
          )
        : 0) + 1;
    if (!sideEffect) return `${type}${order}`;
    (entityOrder[type] as Record<string, Set<number>>)[pageId].add(order);
    return `${type}${order}`;
  }
  if (!entityOrder[type]) {
    (entityOrder[type] as Set<number>) = new Set();
  }
  const order =
    ((entityOrder[type] as Set<number>).size
      ? Math.max(...(entityOrder[type] as Set<number>))
      : 0) + 1;
  if (!sideEffect) return `${type}${order}`;
  (entityOrder[type] as Set<number>).add(order);
  return `${type}${order}`;
}

/**
 * init map when start a new app, from old existing data
 */
export function seedOrderMap(
  entities: { type: string; name: string; pageId?: string }[],
) {
  entities = [
    ...keys(defaultLibraries).map((i) => ({ name: i, type: 'library' })),
    ...entities,
  ];
  entityOrder = {};
  entities.forEach(({ type, name, pageId }) => {
    const nameRe = new RegExp(`${type}\\d+`);
    let order = 0;
    if (nameRe.test(name)) {
      let pos = type.length;
      while (pos < name.length) {
        order *= 10;
        order += +name[pos++];
      }
    }
    if (pageId) {
      if (!(entityOrder[type] as Record<string, Set<number>>)) {
        entityOrder[type] = {};
      }
      if (!(entityOrder[type] as Record<string, Set<number>>)[pageId]) {
        (entityOrder[type] as Record<string, Set<number>>)[pageId] = new Set();
      }
      (entityOrder[type] as Record<string, Set<number>>)[pageId].add(order);
    } else {
      if (!entityOrder[type]) {
        (entityOrder[type] as Set<number>) = new Set();
      }
      (entityOrder[type] as Set<number>).add(order);
    }
  });
}

export function updateOrderMap(
  entities: { type: string; name: string; pageId?: string }[],
  deleted: boolean,
) {
  entities.forEach(({ type, name, pageId }) => {
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

    if (pageId) {
      if (!(entityOrder[type] as Record<string, Set<number>>)) {
        entityOrder[type] = {};
      }
      if (!(entityOrder[type] as Record<string, Set<number>>)[pageId]) {
        (entityOrder[type] as Record<string, Set<number>>)[pageId] = new Set();
      }
    } else {
      if (!entityOrder[type]) {
        (entityOrder[type] as Set<number>) = new Set();
      }
    }

    if (deleted) {
      if (pageId) {
        (entityOrder[type] as Record<string, Set<number>>)[pageId].delete(
          order,
        );
      } else {
        (entityOrder[type] as Set<number>).delete(order);
      }
    } else {
      if (pageId) {
        (entityOrder[type] as Record<string, Set<number>>)[pageId].add(order);
      } else {
        (entityOrder[type] as Set<number>).add(order);
      }
    }
  });
}

export function entityNameExists(entityName: string, entityType: EntityTypes) {
  if (entityType === 'widget') {
    return (
      Object.keys(editorStore.currentPage.widgets).some((widgetId) => {
        return widgetId === entityName;
      }) ||
      Object.keys(editorStore.queries).some((queryId) => {
        return queryId === entityName;
      })
    );
  }
  return (
    Object.values(editorStore.pages).some(({ widgets }) => {
      return Object.keys(widgets).some((widgetId) => {
        return widgetId === entityName;
      });
    }) ||
    Object.keys(editorStore.queries).some((queryId) => {
      return queryId === entityName;
    })
  );
}
