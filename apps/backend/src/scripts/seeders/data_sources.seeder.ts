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
        case 'aws s3':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/353460/aws-s3.svg';
            description =
              'Connect to Amazon S3 buckets and perform various operations on them.';
          }
          break;
        case 'slack':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/303151/slack-logo.svg';
            description = 'Connect to your Slack workspace to send messages.';
          }
          break;
        case 'mongodb':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/373845/mongo.svg';
            description = 'Connect to MongoDB to read and write data.';
          }
          break;
        case 'mysql':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/354099/mysql.svg';
            description = 'Connect to MySQL databases to read and write data.';
          }
          break;
        case 'sql server':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image =
              'https://www.svgrepo.com/show/303229/microsoft-sql-server-logo.svg';
            description = 'Connect to SQL Server to read and write data.';
          }
          break;
        case 'bigquery':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/375551/bigquery.svg';
            description =
              'Connect to BigQuery databases to run BigQuery queries.';
          }
          break;
        case 'google sheets':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/330570/googlesheets.svg';
            description = 'Connect with Google Sheet to read and write data.';
          }
          break;
        case 'openapi':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/306505/openapiinitiative.svg';
            description = 'Generate REST API operations from OpenAPI Specs.';
          }
          break;
        case 'notion':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/452076/notion.svg';
            description =
              'Connect to a Notion workspace to do operations on notion pages, databases and blocks.';
          }
          break;
        case 'github':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/512317/github-142.svg';
          }
          break;
        case 'openai':
          {
            dataSourceConfig = [];
            queryConfig = [];
            image = 'https://www.svgrepo.com/show/306500/openai.svg';
          }
          break;
        case 'graphql':
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
