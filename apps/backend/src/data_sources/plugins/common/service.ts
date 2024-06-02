import { BadRequestException } from '@nestjs/common';
import { QueryRunnerI } from '../../../data_queries/query.interface';
import PostgresqlQueryService from '../postgresql/main';
import RESTQueryService from '../restapi/main';
import GoogleCloudStorageQueryService from '../gcs/main';
import MongoDBQueryService from '../mongodb/main';
import AzureBlobStorageQueryService from '../azure_blob_storage/main';

export const getQueryService = (name: string): QueryRunnerI => {
  switch (name.toLowerCase()) {
    case 'postgresql':
      return new PostgresqlQueryService();
    case 'rest api':
      return new RESTQueryService();
      case 'google cloud storage':
        return new GoogleCloudStorageQueryService();
      case 'mongodb':
      return new MongoDBQueryService();
    case 'azure blob storage':
      return new AzureBlobStorageQueryService();
    default:
      throw new BadRequestException();
  }
};
