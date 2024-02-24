import { QueryConfig, QueryRet } from '../../../data_queries/query.types';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import { BlobServiceClient } from '@azure/storage-blob';
import { ConfigT, QueryT } from './types';
import {
  createContainer,
  deleteBlob,
  deleteContainer,
  listBlobs,
  listContainers,
  readBlob,
  uploadBlob,
} from './operations';

export default class AzureBlobStorageQueryService
  implements QueryRunnerI<ConfigT, QueryT>
{
  async run(
    dataSourceConfig: ConfigT,
    query: QueryConfig<QueryT>,
  ): Promise<QueryRet> {
    try {
      const client = this.connect(dataSourceConfig);
      const data = await this.runQuery(query.query.query, client);
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

  async runQuery(query: QueryT['query'], client: BlobServiceClient) {
    switch (query.operation) {
      case 'List containers':
        return await listContainers(client);
      case 'List blobs':
        return await listBlobs(query, client);
      case 'Create container':
        return await createContainer(client);
      case 'Upload blob':
        return await uploadBlob(query, client);
      case 'Delete container':
        return await deleteContainer(query, client);
      case 'Delete blob':
        return await deleteBlob(query, client);
      case 'Read blob':
        return await readBlob(query, client);
    }
  }

  connect(dataSourceConfig: ConfigT): BlobServiceClient {
    return BlobServiceClient.fromConnectionString(
      dataSourceConfig.connectionString,
    );
  }
}
