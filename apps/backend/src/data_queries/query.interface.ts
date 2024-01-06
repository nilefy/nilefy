import { DataSourceConfigT } from '../dto/data_sources.dto';
import { QueryConfig, QueryRet } from './query.types';

export interface QueryRunnerI<
  T extends DataSourceConfigT = DataSourceConfigT,
  U extends Record<string, unknown> = Record<string, unknown>,
> {
  run(dataSourceConfig: T, query: QueryConfig<U>): Promise<QueryRet>;

  connect?(dataSourceConfig: T): any;

  testConnection?: (dataSourceConfig: T) => Promise<boolean>;
}
