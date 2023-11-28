import { DataSourceConfigT } from '../dto/data_sources.dto';
import { QueryRet } from './query.types';

type QueryConfig<T = unknown> = {
  nama: string;
  query: Record<string, T>;
};
export interface QueryRunnerI {
  run(
    dataSourceConfig: DataSourceConfigT,
    query: QueryConfig,
  ): Promise<QueryRet>;

  connect(dataSourceConfig: DataSourceConfigT): any;

  testConnection?: (dataSourceConfig: DataSourceConfigT) => Promise<boolean>;
}
