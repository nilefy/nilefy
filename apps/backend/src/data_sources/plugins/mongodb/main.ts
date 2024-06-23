import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { configSchema, ConfigT, querySchema, QueryT } from './types';
import { mongodb as OPERATIONS } from '../common/operations';
import { MongoClient } from 'mongodb';
import {
  createDocument,
  deleteDocument,
  findDocument,
  replaceDocument,
  updateDocument,
  viewCollections,
  countDocuments,
} from './operations';

export default class MongoDBQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    try {
      await Promise.all([
        configSchema.parseAsync(dataSourceConfig),
        querySchema.parseAsync(query.query),
      ]);
      const client = this.connect(dataSourceConfig);
      const data = await this.runQuery(query.query, client);
      await client.close();
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

  async runQuery(query: QueryT, client: MongoClient) {
    switch (query.operation) {
      case OPERATIONS.CREATE_DOC:
        return createDocument(query, client);
      case OPERATIONS.FIND_DOC:
        return findDocument(query, client);
      case OPERATIONS.VIEW_COLLECTIONS:
        return viewCollections(query, client);
      case OPERATIONS.COUNT_DOCS:
        return countDocuments(query, client);
      case OPERATIONS.UPDATE_DOC:
        return updateDocument(query, client);
      case OPERATIONS.REPLACE_DOC:
        return replaceDocument(query, client);
      case OPERATIONS.DELETE_DOC:
        return deleteDocument(query, client);
    }
  }

  connect(dataSourceConfig: ConfigT): MongoClient {
    return new MongoClient(dataSourceConfig.uri);
  }

  async testConnection(dataSourceConfig: ConfigT) {
    try {
      const client = new MongoClient(dataSourceConfig.uri);
      await client.connect();
      await client.close();
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
    }
  }
}
