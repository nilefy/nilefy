import { EntityDependents } from './entityDependents';

export interface Snapshotable<T = unknown> {
  get snapshot(): T;
}
export interface Dependable {
  dependents: EntityDependents;
}
