export interface Snapshotable<T = unknown> {
  get snapshot(): T;
}
export interface RuntimeEvaluable {
  /**
   * insert any value needed to be reachable from the evaluationManager
   */
  rawValues: Record<string, unknown>;
  values: Record<string, unknown>;
}

export type RuntimeProps = Record<string, unknown>;
export type EvaluatedRunTimeProps = SnapshotProps;
export type SnapshotProps = Record<string, unknown>;
