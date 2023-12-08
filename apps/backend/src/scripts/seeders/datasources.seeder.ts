import { faker } from '@faker-js/faker';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import { DataSourceDto } from '../../dto/data_sources.dto';
import { dataSources } from '../../drizzle/schema/data_sources.schema';

function generateFakeDataSource(): Omit<DataSourceDto, 'id'> {
  return {
    config: [
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
        ],
      },
    ],
    image: faker.helpers.arrayElement([faker.image.url(), null]),
    type: faker.helpers.arrayElement([
      'database',
      'api',
      'cloud storage',
      'plugin',
    ]),
    name: faker.commerce.productName(),
    description: faker.helpers.arrayElement([
      faker.commerce.productDescription(),
      null,
    ]),
  };
}

export async function datasourcesSeeder(db: DatabaseI) {
  console.log('running DATASOURCES seeder');

  const fakeDS = faker.helpers.multiple(generateFakeDataSource, {
    count: 50,
  });

  return await db.insert(dataSources).values(fakeDS).returning();
}
