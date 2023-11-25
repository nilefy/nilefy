import { DataSourceConfigT } from '../dto/data_sources.dto';
import { QueryT, QueryRet } from './query.types';

export interface QueryRunnerI {
  run(dataSourceConfig: DataSourceConfigT, query: QueryT): Promise<QueryRet>;

  connect(dataSourceConfig: DataSourceConfigT): any;
}
