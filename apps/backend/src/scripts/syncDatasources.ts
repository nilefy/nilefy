import { DatabaseI, dataSources as dataSourcesSchema } from '@nilefy/database';
import {
  pluginConfigForm as postgresConfigForm,
  queryConfigForm as postgresQueryConfigForm,
} from '../data_sources/plugins/postgresql/types';
import {
  pluginConfigForm as restApiConfigForm,
  queryConfigForm as restApiQueryConfigForm,
} from '../data_sources/plugins/restapi/types';
import {
  pluginConfigForm as googleSheetsConfigForm,
  queryConfigForm as googleSheetsQueryConfigForm,
} from '../data_sources/plugins/googlesheets/types';
import {
  pluginConfigForm as GCSConfigForm,
  queryConfigForm as GCSQueryConfigForm,
} from '../data_sources/plugins/gcs/types';
import {
  pluginConfigForm as mongodbConfigForm,
  queryConfigForm as mongodbQueryConfigForm,
} from '../data_sources/plugins/mongodb/types';
import {
  pluginConfigForm as azureBlobStorageConfigForm,
  queryConfigForm as azureBlobStorageQueryConfigForm,
} from '../data_sources/plugins/azure_blob_storage/types';
import { DataSourceT } from './seeders/seeder.types';
import { sql } from 'drizzle-orm';

// array to hold plugin with its id and config
const dataSources: (DataSourceT & { id: number })[] = [
  {
    id: 1,
    name: 'PostgreSQL',
    type: 'database',
    config: postgresConfigForm,
    queryConfig: postgresQueryConfigForm,
    image: 'https://www.svgrepo.com/show/354200/postgresql.svg',
    description: 'Connect to PostgreSQL databases to read and modify data.',
  },
  {
    id: 2,
    name: 'MongoDB',
    type: 'database',
    config: mongodbConfigForm,
    queryConfig: mongodbQueryConfigForm,
    image: 'https://www.svgrepo.com/show/373845/mongo.svg',
    description: 'Connect to MongoDB to read and write data.',
  },
  {
    id: 3,
    name: 'REST API',
    type: 'api',
    config: restApiConfigForm,
    queryConfig: restApiQueryConfigForm,
    image: 'https://www.svgrepo.com/show/447473/rest-api.svg',
    description:
      'Connect with REST API endpoints and create queries to interact with it.',
  },
  {
    id: 4,
    name: 'Azure Blob Storage',
    type: 'cloud storage',
    config: azureBlobStorageConfigForm,
    queryConfig: azureBlobStorageQueryConfigForm,
    image: 'https://www.svgrepo.com/show/448272/azure-blob-storage.svg',
    description:
      'Connect to Azure Blob storage containers to read and manipulate unstructured data.',
  },
  {
    id: 5,
    name: 'Google Cloud Storage',
    type: 'cloud storage',
    config: GCSConfigForm,
    queryConfig: GCSQueryConfigForm,
    image: 'https://www.svgrepo.com/show/353806/google-cloud-functions.svg',
    description:
      'Connect to GCS buckets and perform various operations on them.',
  },
  {
    id: 6,
    name: 'Google Sheets',
    type: 'cloud storage',
    config: googleSheetsConfigForm,
    queryConfig: googleSheetsQueryConfigForm,
    image: 'https://mailmeteor.com/logos/assets/SVG/Google_Sheets_Logo.svg',
    description:
      'Connect to Google Sheets to read and modify spreadsheet data.',
  },
] as const;

/**
 * does upsert on all datasource metadata information based on the datasource `id`
 *
 * PLEASE NOTE: this method depends on datasource id based on the fact that ids are hardcoded with every datasource
 */
export async function syncDataSources(db: DatabaseI) {
  console.log('Sync DataSources');
  await db
    .insert(dataSourcesSchema)
    .values(dataSources)
    .onConflictDoUpdate({
      target: dataSourcesSchema.id,
      set: {
        name: sql.raw(`excluded.${dataSourcesSchema.name.name}`),
        type: sql.raw(`excluded.${dataSourcesSchema.type.name}`),
        description: sql.raw(`excluded.${dataSourcesSchema.description.name}`),
        image: sql.raw(`excluded.${dataSourcesSchema.image.name}`),
        config: sql.raw(`excluded.${dataSourcesSchema.config.name}`),
        queryConfig: sql.raw(`excluded.${dataSourcesSchema.queryConfig.name}`),
      },
    });
}
