import { DataSourceConfigT } from '../dto/data_sources.dto';
import { QueryConfig, QueryRet } from './query.types';

export type TestConnectionT = Promise<{
  /**
   * connection state
   */
  connected: boolean;
  /**
   * if the plugin wants to return message with the connection test result
   */
  msg?: string;
}>;
export interface QueryRunnerI<
  T extends DataSourceConfigT = DataSourceConfigT,
  U extends Record<string, unknown> = Record<string, unknown>,
> {
  run(
    /**
     * evaluated datasource config
     */
    dataSourceConfig: T,
    /**
     * query containg its evaluated config
     */
    query: QueryConfig<U>,
  ): Promise<QueryRet>;

  connect?(dataSourceConfig: T): any;

  testConnection?: (dataSourceConfig: T) => TestConnectionT;
}
