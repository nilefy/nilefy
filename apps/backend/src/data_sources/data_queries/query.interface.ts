import { QueryT, QueryRet } from './query.types';

export interface QueryRunnerI {
  run(
    dataSourceConfig: object,
    query: QueryT,
  ): Promise<QueryRet>;

  connect(dataSourceConfig: object, dataSourceId: number): Promise<any>;
}
