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
import { AZURE_BLOB_STORAGE as OPERATIONS } from '../common/operations';

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

  async runQuery(query: QueryT['query'], client: BlobServiceClient) {
    switch (query.operation) {
      case OPERATIONS.LIST_CONTAINERS:
        return await listContainers(query, client);
      case OPERATIONS.LIST_BLOBS:
        return await listBlobs(query, client);
      case OPERATIONS.CREATE_CONTAINER:
        return await createContainer(query, client);
      case OPERATIONS.UPLOAD_BLOB:
        return await uploadBlob(query, client);
      case OPERATIONS.DELETE_CONTAINER:
        return await deleteContainer(query, client);
      case OPERATIONS.DELETE_BLOB:
        return await deleteBlob(query, client);
      case OPERATIONS.READ_BLOB:
        return await readBlob(query, client);
    }
  }

  connect(dataSourceConfig: ConfigT): BlobServiceClient {
    return BlobServiceClient.fromConnectionString(
      dataSourceConfig.connectionString,
    );
  }
}
