import { faker } from '@faker-js/faker';
import {
  dataSources,
  dataSourcesEnum,
  DataSourceT,
  ConfigT,
} from '../seeders/seeder.types';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import * as schema from '../../drizzle/schema/data_sources.schema';
import {
  QueryT as PostgresqlQueryConfigT,
  ConfigT as PostgresqlConfigT,
} from '../../data_sources/plugins/postgresql/types';

export async function dataSourcesSeeder(db: DatabaseI) {
  console.log('running DATA SOURCES seeder');

  const ds: DataSourceT[] = [];
  dataSourcesEnum.options.forEach((type) => {
    dataSources[type].forEach((name) => {
      let dataSourceConfig: unknown;
      let queryConfig: unknown;

      if (name === 'postgresql') {
        const postgresqlConfig: ConfigT<PostgresqlConfigT> = [
          {
            sectionName: 'Development',
            children: [
              {
                id: 'host',
                key: 'host',
                label: 'Host',
                type: 'input',
                options: {
                  placeholder: 'localhost',
                  type: 'text',
                },
              },
              {
                id: 'port',
                key: 'port',
                label: 'Port',
                type: 'input',
                options: {
                  placeholder: 5432,
                  type: 'number',
                },
              },
              {
                id: 'ssl',
                key: 'ssl',
                label: 'SSL',
                type: 'checkbox',
                options: {},
              },
              {
                id: 'database_name',
                key: 'database',
                label: 'Database Name',
                type: 'input',
                options: {
                  placeholder: 'Name of the database',
                  type: 'text',
                },
              },
              {
                id: 'username',
                key: 'user',
                label: 'Username',
                type: 'input',
                options: {
                  placeholder: 'Enter username',
                  type: 'text',
                },
              },
              {
                id: 'password',
                key: 'password',
                label: 'Password',
                type: 'input',
                options: {
                  placeholder: 'Enter password',
                  type: 'password',
                },
              },
              {
                id: 'certificate',
                key: 'sslCertificate',
                label: 'SSL Certificate',
                type: 'select',
                options: {
                  items: [
                    {
                      label: 'CA Certificate',
                      value: 'ca',
                    },
                    {
                      label: 'Self-signed Certificate',
                      value: 'self-signed',
                    },
                    {
                      label: 'None',
                      value: 'none',
                    },
                  ],
                  placeholder: 'None',
                },
              },
              // TODO: add connection options key-value pairs
            ],
          },
        ];
        const postgresqlQueryConfig: ConfigT<PostgresqlQueryConfigT> = [
          {
            sectionName: '',
            children: [
              {
                id: 'sql',
                key: 'query',
                label: 'SQL',
                type: 'sqlEditor',
                options: { placeholder: 'select * from table;' },
              },
            ],
          },
        ];
        dataSourceConfig = postgresqlConfig;
        queryConfig = postgresqlQueryConfig;
      } else {
        dataSourceConfig = [];
        queryConfig = [];
      }

      ds.push({
        type,
        name,
        description: faker.helpers.arrayElement([
          faker.commerce.productDescription(),
          null,
        ]),
        image: faker.helpers.arrayElement([faker.image.url(), null]),
        config: JSON.stringify(dataSourceConfig),
        queryConfig: JSON.stringify(queryConfig),
      });
    });
  });

  await db.insert(schema.dataSources).values(ds);
}
