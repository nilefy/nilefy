import { QueryT, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { ConfigT } from './types';
import { Pool, PoolConfig } from 'pg';

export default class PostgresqlQueryService implements QueryRunnerI {
  async run(dataSourceConfig: ConfigT, query: QueryT): Promise<QueryRet> {
    const pool = this.connect(dataSourceConfig);

    // TODO: query format

    const res = await pool.query(query.query.query);

    return {
      status: 200,
      data: res,
    };
  }

  connect(dataSourceConfig: ConfigT): Pool {
    const config: PoolConfig = {
      ...dataSourceConfig,
      statement_timeout: 10000,
      connectionTimeoutMillis: 10000,
    };

    // TODO: ssl + connection options

    return new Pool(config);
  }
}
