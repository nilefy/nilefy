import { faker } from '@faker-js/faker';
import {
  dataSources,
  dataSourcesEnum,
  DataSourceT,
} from '../seeders/seeder.types';
import {
  pluginConfigForm as postgresConfigForm,
  queryConfigForm as postgresQueryConfigForm,
} from '../../data_sources/plugins/postgresql/types';
import {
  pluginConfigForm as restApiConfigForm,
  queryConfigForm as restApiQueryConfigForm,
} from '../../data_sources/plugins/restapi/types';
import {
  pluginConfigForm as GCSConfigForm,
  queryConfigForm as GCSQueryConfigForm,
} from '../../data_sources/plugins/gcs/types';
import {
  pluginConfigForm as mongodbConfigForm,
  queryConfigForm as mongodbQueryConfigForm,
} from '../../data_sources/plugins/mongodb/types';
import { DatabaseI, dataSources as dataSourcesSchema } from '@webloom/database';

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
        case 'mongodb':
          {
            dataSourceConfig = mongodbConfigForm;
            queryConfig = mongodbQueryConfigForm;
            image = 'https://www.svgrepo.com/show/373845/mongo.svg';
            description = 'Connect to MongoDB to read and write data.';
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
            dataSourceConfig = GCSConfigForm;
            queryConfig = GCSQueryConfigForm;
            image =
              'https://www.svgrepo.com/show/353806/google-cloud-functions.svg';
            description =
              'Connect to GCS buckets and perform various operations on them.';
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

  await db.insert(dataSourcesSchema).values(ds);
}
