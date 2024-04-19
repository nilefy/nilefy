import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { configSchema, ConfigT, QueryT } from './types';
import { MongoClient } from 'mongodb';

export default class MongoDBQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    try {
      configSchema.parse(dataSourceConfig);
      const client = this.connect(dataSourceConfig);
      const data = await this.runQuery(query.query.query, client);
      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      return {
        statusCode: 500,
        data: {},
        error: (error as Error).message,
      };
    }
  }

  async runQuery(query: QueryT['query'], client: MongoClient) {
    switch (query.operation) {
      case 'Create Document':
        return;
      case 'Find Document':
        return;
      case 'View Database Collections':
        return;
      case 'View Collection Documents':
        return;
      case 'Update Document':
        return;
      case 'Replace Document':
        return;
      case 'Delete Document':
        return;
    }
  }

  connect(dataSourceConfig: ConfigT): MongoClient {
    return new MongoClient(dataSourceConfig.uri);
  }

  async testConnection(dataSourceConfig: ConfigT) {
    const client = new MongoClient(dataSourceConfig.uri);
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
      await client.close();
    }
  }
}
