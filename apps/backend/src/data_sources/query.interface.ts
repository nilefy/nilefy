import { QueryT, QueryRet } from './query.types';

export interface QueryRunnerI {
  run(
    dataSourceConfig: object,
    query: QueryT,
    ids: {
      workspaceId: number;
      appId: number;
      dataSourceId: number;
      userId: number;
    },
  ): Promise<QueryRet>;

  connect(dataSourceConfig: object, dataSourceId: number): Promise<any>;
}
