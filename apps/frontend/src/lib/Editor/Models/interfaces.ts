export interface Snapshotable<T = unknown> {
  get snapshot(): T;
}
export interface RuntimeEvaluable {
  rawValues: Record<string, unknown>;
  values: Record<string, unknown>;
}
