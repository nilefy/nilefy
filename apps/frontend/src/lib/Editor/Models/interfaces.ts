export interface Snapshotable<T = unknown> {
  get snapshot(): T;
}
export interface RuntimeEvaluable {
  /**
   * should contains any publically available value
   * - would be shown with autocompletation
   * - will be used in evaluationManager to evaluate another entities props
   */
  rawValues: Record<string, unknown>;
  /**
   * use it to expose evaluated props
   */
  values: Record<string, unknown>;
}

export type RuntimeProps = Record<string, unknown>;
export type EvaluatedRunTimeProps = SnapshotProps;
export type SnapshotProps = Record<string, unknown>;
