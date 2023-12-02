import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { ConfigT, QueryT } from './types';
import { Pool, PoolConfig } from 'pg';

export default class PostgresqlQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    const pool = this.connect(dataSourceConfig);

    try {
      const res = await pool.query(query.query.query);
      return {
        status: 200,
        data: res,
      };
    } catch (error) {
      return {
        status: 500,
        data: {},
        error,
      };
    }
  }

  connect(dataSourceConfig: ConfigT): Pool {
    // TODO: valid config
    const config: PoolConfig = {
      ...dataSourceConfig,
      statement_timeout: 10000,
      connectionTimeoutMillis: 10000,
    };

    // TODO: ssl + connection options

    return new Pool(config);
  }
}
