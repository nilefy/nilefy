import { faker } from '@faker-js/faker';
import { dataSources, dataSourcesEnum } from '../seeders/seeder.types';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import * as schema from '../../drizzle/schema/data_sources.schema';
import { DataSourceDto } from 'src/dto/data_sources.dto';

type DS = Omit<DataSourceDto, 'id'>;

export async function dataSourcesSeeder(db: DatabaseI) {
  console.log('running DATA SOURCES seeder');

  const ds: DS[] = [];
  dataSourcesEnum.options.forEach((type) => {
    dataSources[type].forEach((name) => {
      ds.push({
        type,
        name,
        description: faker.helpers.arrayElement([
          faker.commerce.productDescription(),
          null,
        ]),
        image: faker.helpers.arrayElement([faker.image.url(), null]),
        config: {},
      });
    });
  });

  await db.insert(schema.dataSources).values(ds);
}
