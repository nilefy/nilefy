import { AddQueryDto } from '../dto/data_queries.dto';
import { DataSourceConfigT } from '../dto/data_sources.dto';
import { QueryRet } from './query.types';

export interface QueryRunnerI {
  run(
    dataSourceConfig: DataSourceConfigT,
    query: AddQueryDto,
  ): Promise<QueryRet>;

  connect(dataSourceConfig: DataSourceConfigT): any;
}
