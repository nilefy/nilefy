import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { parsedConfigSchema, ConfigT, ParsedConfigT, QueryT } from './types';
import { Storage } from '@google-cloud/storage';
import {
  bucketFiles,
  listBuckets,
  readFile,
  signForDownload,
  signForUpload,
  uploadFile,
} from './operations';

export default class PostgresqlQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    try {
      this.connect(dataSourceConfig);
      const data = await this.runQuery(query.query.query);
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

  async runQuery(query: QueryT['query']) {
    switch (query.operation) {
      case 'Read file':
        return await readFile();
      case 'Upload file':
        return await uploadFile();
      case 'List buckets':
        return await listBuckets();
      case 'List files in a bucket':
        return await bucketFiles();
      case 'Signed url for download':
        return await signForDownload();
      case 'Signed url for upload':
        return await signForUpload();
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
