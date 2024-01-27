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

      switch (name.toLocaleLowerCase()) {
        case 'postgresql':
          {
            dataSourceConfig = postgresConfigForm;
            queryConfig = postgresQueryConfigForm;
          }
          break;
        case 'rest api':
          {
            dataSourceConfig = restApiConfigForm;
            queryConfig = restApiQueryConfigForm;
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
        description: faker.helpers.arrayElement([
          faker.commerce.productDescription(),
          null,
        ]),
        image: faker.helpers.arrayElement([faker.image.url(), null]),
        config: dataSourceConfig,
        queryConfig: queryConfig,
      });
    });
  });

  await db.insert(schema.dataSources).values(ds);
}
