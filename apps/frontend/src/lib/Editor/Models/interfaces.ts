export interface Snapshotable<T = unknown> {
  get snapshot(): T;
}
