import { faker } from '@faker-js/faker';
import {
  dataSources,
  dataSourcesEnum,
  DataSourceT,
  ConfigT,
} from '../seeders/seeder.types';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import * as schema from '../../drizzle/schema/data_sources.schema';

export async function dataSourcesSeeder(db: DatabaseI) {
  console.log('running DATA SOURCES seeder');

  const ds: DataSourceT[] = [];
  dataSourcesEnum.options.forEach((type) => {
    dataSources[type].forEach((name) => {
      let config: ConfigT;

      if (name === 'postgresql') {
        config = [
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
                  placeholder: 5000,
                  type: 'number',
                },
              },
              {
                id: 'ssl',
                key: 'ssl',
                label: 'SSL',
                type: 'input',
              },
              {
                id: 'database_name',
                key: 'database_name',
                label: 'Database Name',
                type: 'input',
                options: {
                  placeholder: 'Name of the database',
                  type: 'text',
                },
              },
              {
                id: 'username',
                key: 'username',
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
                key: 'certificate',
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
      } else {
        config = [];
      }

      ds.push({
        type,
        name,
        description: faker.helpers.arrayElement([
          faker.commerce.productDescription(),
          null,
        ]),
        image: faker.helpers.arrayElement([faker.image.url(), null]),
        config: JSON.stringify(config),
      });
    });
  });

  await db.insert(schema.dataSources).values(ds);
}
