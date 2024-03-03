import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { parsedConfigSchema, ConfigT, ParsedConfigT, QueryT } from './types';
import { Storage } from '@google-cloud/storage';
import {
  bucketFiles,
  listBuckets,
  deleteFile,
  downloadFile,
  uploadFile,
} from './operations';
import { GCS as OPERATIONS } from '../common/operations';

export default class GoogleCloudStorageQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    try {
      const storage = this.connect(dataSourceConfig);
      const data = await this.runQuery(query.query.query, storage);
      return {
        status: 200,
        data,
      };
    } catch (error) {
      return {
        status: 500,
        data: {},
        error: (error as Error).message,
      };
    }
  }

  async runQuery(query: QueryT['query'], storage: Storage) {
    switch (query.operation) {
      case OPERATIONS.DELETE_FILE:
        return await deleteFile(query, storage);
      case OPERATIONS.UPLOAD_FILE:
        return await uploadFile(query, storage);
      case OPERATIONS.LIST_BUCKETS:
        return await listBuckets(storage);
      case OPERATIONS.LIST_FILES:
        return await bucketFiles(query, storage);
      case OPERATIONS.DOWNLOAD_FILE:
        return await downloadFile(query, storage);
    }
  }

  connect(dataSourceConfig: ConfigT): Storage {
    const parsedConfig: ParsedConfigT = JSON.parse(dataSourceConfig.privateKey);
    parsedConfigSchema.parse(parsedConfig);
    return new Storage({
      projectId: parsedConfig.project_id,
      credentials: parsedConfig,
    });
  }
}
