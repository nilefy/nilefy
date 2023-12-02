import { DataSourceConfigT } from '../dto/data_sources.dto';
import { QueryConfig, QueryRet } from './query.types';

export interface QueryRunnerI {
  run(
    dataSourceConfig: DataSourceConfigT,
    query: QueryConfig,
  ): Promise<QueryRet>;

  connect?(dataSourceConfig: DataSourceConfigT): any;

  testConnection?: (dataSourceConfig: DataSourceConfigT) => Promise<boolean>;
}
