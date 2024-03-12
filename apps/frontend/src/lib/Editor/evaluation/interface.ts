import { Entity } from '../Models/entity';

export type EvaluationContext = Record<string, unknown>;

/**
 * @example { type: 'SETTER', name: 'setVisiblity', path: 'isVisible' } -> widget.setVisiblity(true)
 */
export type EntityActionSetter = {
  type: 'SETTER';
  name: string;
  path: string;
};
/**
 * @example { type: 'SIDE_EFFECT', name: 'runQuery', fn:(entity:Query) => { query.runQuery(); } -> query1.runQuery()
 */
export type EntityActionSideEffect<T extends Entity> = {
  type: 'SIDE_EFFECT';
  name: string;
  fn: (entity: T, ...args: unknown[]) => void;
};

export type EntityActionRawSideEffect = {
  type: 'SIDE_EFFECT';
  name: string;
};

export type EntityActionRaw = EntityActionSetter | EntityActionRawSideEffect;
export type EntityActionRawConfig = Record<string, EntityActionRaw>;
export type EntityAction<T extends Entity> =
  | EntityActionSetter
  | EntityActionSideEffect<T>;

export type EntityActionConfig<T extends Entity = Entity> = Record<
  string,
  EntityAction<T>
>;
