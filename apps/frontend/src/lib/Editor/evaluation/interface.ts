import { Entity } from '../Models/entity';

export type EvaluationContext = Record<string, unknown>;

/**
 * @example { type: 'SETTER', name: 'setVisiblity', path: 'isVisible' } -> widget.setVisiblity(true)
 */
export type EntityActionSetter = {
  type: 'SETTER';
  name: string;
  path: string;
  value?: unknown;
};
/**
 * @example { type: 'SIDE_EFFECT', name: 'runQuery', fn:(entity:Query) => { query.runQuery(); } }
 * // in the code editor you can now type
 *  query1.runQuery()
 */
export type EntityActionSideEffect<T extends Entity> = {
  type: 'SIDE_EFFECT';
  name: string;
  fn: (entity: T, ...args: unknown[]) => any | Promise<any>;
};

export type EntityActionRawSideEffect = {
  type: 'SIDE_EFFECT';
  name: string;
};

export type EntityActionRaw = EntityActionSetter | EntityActionRawSideEffect;
export type EntityActionRawConfig = Record<string, EntityActionRaw>;
/**
 * @param isPrivate if true the action will not be exposed to the user in the code editor
 */
export type EntityAction<T extends Entity> = {
  type: 'SETTER' | 'SIDE_EFFECT';
  isPrivate?: boolean;
} & (EntityActionSetter | EntityActionSideEffect<T>);

export type EntityActionConfig<T extends Entity = Entity> = Record<
  string,
  EntityAction<T>
>;
