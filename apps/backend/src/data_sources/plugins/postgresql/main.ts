import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { configSchema, ConfigT, QueryT } from './types';
import { Pool, PoolConfig, Client } from 'pg';
import { Logger } from '@nestjs/common';

export default class PostgresqlQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    try {
      configSchema.parse(dataSourceConfig);
      const pool = this.connect(dataSourceConfig);
      const res = await pool.query(query.query.query);
      return {
        status: 200,
        data: res.rows,
      };
    } catch (error) {
      return {
        status: 500,
        data: {},
        error: (error as Error).message,
      };
    }
  }

  connect(dataSourceConfig: ConfigT): Pool {
    // TODO: valid config
    const config: PoolConfig = {
      ...dataSourceConfig,
      // statement_timeout: 10000,
      // connectionTimeoutMillis: 10000,
      ssl: dataSourceConfig.ssl,
    };

    // TODO: ssl + connection options

    return new Pool(config);
  }

  async testConnection(dataSourceConfig: ConfigT) {
    const client = new Client({
      ...dataSourceConfig,
      connectionTimeoutMillis: 10000,
    });
    try {
      await client.connect();
      return {
        connected: true,
        msg: 'connected successfully',
      };
    } catch (error) {
      return {
        connected: false,
        msg:
          error instanceof Error
            ? error.message
            : 'unknown error please check your credentials',
      };
    } finally {
      await client.end();
    }
  }
}
