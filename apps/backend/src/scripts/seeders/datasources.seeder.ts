import { faker } from '@faker-js/faker';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import { DataSourceDto } from '../../dto/data_sources.dto';
import { dataSources } from '../../drizzle/schema/data_sources.schema';

function generateFakeDataSource(): Omit<DataSourceDto, 'id'> {
  return {
    config: {},
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
