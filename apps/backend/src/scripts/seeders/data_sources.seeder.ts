import { faker } from '@faker-js/faker';
import {
  dataSources,
  dataSourcesEnum,
  DataSourceT,
} from '../seeders/seeder.types';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import * as schema from '../../drizzle/schema/data_sources.schema';
import {
  pluginConfigForm as postgresConfigForm,
  queryConfigForm as postgresQueryConfigForm,
} from '../../data_sources/plugins/postgresql/types';
import {
  pluginConfigForm as restApiConfigForm,
  queryConfigForm as restApiQueryConfigForm,
} from '../../data_sources/plugins/restapi/types';
import {
  pluginConfigForm as googleSheetsConfigForm,
  queryConfigForm as googleSheetsQueryConfigForm,
} from '../../data_sources/plugins/googlesheets/types';

export async function dataSourcesSeeder(db: DatabaseI) {
  console.log('running DATA SOURCES seeder');

  const ds: DataSourceT[] = [];
  dataSourcesEnum.options.forEach((type) => {
    dataSources[type].forEach((name) => {
      let dataSourceConfig;
      let queryConfig;
      let image = faker.helpers.arrayElement([faker.image.url(), null]);
      let description = faker.helpers.arrayElement([
        faker.commerce.productDescription(),
        null,
      ]);

      switch (name.toLocaleLowerCase()) {
        case 'postgresql':
          {
            dataSourceConfig = postgresConfigForm;
            queryConfig = postgresQueryConfigForm;
            image = 'https://www.svgrepo.com/show/354200/postgresql.svg';
            description =
              'Connect to PostgreSQL databases to read and modify data.';
          }
          break;
        case 'rest api':
          {
            dataSourceConfig = restApiConfigForm;
            queryConfig = restApiQueryConfigForm;
            image = 'https://www.svgrepo.com/show/447473/rest-api.svg';
            description =
              'Connect with REST API endpoints and create queries to interact with it.';
          }
          break;
        case 'azure blob storage':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image =
              'https://www.svgrepo.com/show/448272/azure-blob-storage.svg';
            description =
              'Connect to Azure Blob storage containers to read and manipulate unstructured data.';
          }
          break;
        case 'google cloud storage':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image =
              'https://www.svgrepo.com/show/353806/google-cloud-functions.svg';
            description =
              'Connect to GCS buckets and perform various operations on them.';
          }
          break;
        case 'google sheets':
          dataSourceConfig = googleSheetsConfigForm; // Google Sheets config form
          queryConfig = googleSheetsQueryConfigForm; // Google Sheets query config form
          image =
            'https://mailmeteor.com/logos/assets/SVG/Google_Sheets_Logo.svg';
          description =
            'Connect to Google Sheets to read and modify spreadsheet data.';
          break;
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/373644/graphql.svg';
            description = 'Connect with GraphQL endpoints to run queries.';
          }
          break;
        default: {
          dataSourceConfig = [];
          queryConfig = [];
        }
      }

      ds.push({
        type,
        name,
        image,
        description,
        config: dataSourceConfig,
        queryConfig: queryConfig,
      });
    });
  });

  await db.insert(schema.dataSources).values(ds);
}
