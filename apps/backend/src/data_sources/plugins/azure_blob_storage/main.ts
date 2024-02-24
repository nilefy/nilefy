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
import { AZURE_BLOB_STORAGE } from '../common/operations';

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
      case AZURE_BLOB_STORAGE.LIST_CONTAINERS:
        return await listContainers(client);
      case AZURE_BLOB_STORAGE.LIST_BLOBS:
        return await listBlobs(query, client);
      case AZURE_BLOB_STORAGE.CREATE_CONTAINER:
        return await createContainer(client);
      case AZURE_BLOB_STORAGE.UPLOAD_BLOB:
        return await uploadBlob(query, client);
      case AZURE_BLOB_STORAGE.DELETE_CONTAINER:
        return await deleteContainer(query, client);
      case AZURE_BLOB_STORAGE.DELETE_BLOB:
        return await deleteBlob(query, client);
      case AZURE_BLOB_STORAGE.READ_BLOB:
        return await readBlob(query, client);
    }
  }

  connect(dataSourceConfig: ConfigT): BlobServiceClient {
    return BlobServiceClient.fromConnectionString(
      dataSourceConfig.connectionString,
    );
  }
}
