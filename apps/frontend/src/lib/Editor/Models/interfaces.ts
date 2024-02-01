export interface Snapshotable<T = unknown> {
  get snapshot(): T;
}
export interface RuntimeEvaluable {
  /**
   * some inner state to the entity that needs to get evaluated
   * could be nested objects
   */
  get propsToBeEvaluated(): Record<string, unknown>;
  /**
   * should contains any publically available value
   * - would be shown with autocompletation
   * - will be used in evaluationManager to evaluate another entities props
   * could be nested objects
   */
  get publicProps(): Record<string, unknown>;
}

export type RuntimeProps = Record<string, unknown>;
export type EvaluatedRunTimeProps = SnapshotProps;
export type SnapshotProps = Record<string, unknown>;
