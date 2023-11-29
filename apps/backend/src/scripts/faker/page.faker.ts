import { faker } from '@faker-js/faker';
import { PageDto } from '../../dto/pages.dto';
import { AppDto } from '../../dto/apps.dto';
import { UserDto } from 'src/dto/users.dto';

/**
 * Omitted the id to let the db handle it
 */
export function generateFakePage(
  appIds: AppDto['id'][],
  userIds: UserDto['id'][],
): Omit<PageDto, 'id'> {
  return {
    createdById: faker.helpers.arrayElement(userIds),
    updatedById: faker.helpers.arrayElement(userIds),
    deletedById: faker.helpers.arrayElement([null]),
    handle: faker.lorem.slug(),
    name: faker.commerce.productName(),
    enabled: faker.datatype.boolean(),
    visible: faker.datatype.boolean(),
    index: faker.datatype.number(),
    appId: faker.helpers.arrayElement(appIds),
    createdAt: faker.date.past(),
    updatedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
  };
}
