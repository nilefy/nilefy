import { generateFakePage } from '../faker/page.faker'; // Import the new faker function
import { faker } from '@faker-js/faker';
import { pages as pagesSchema } from '../../drizzle/schema/appsState.schema';
import { AppDto } from '../../dto/apps.dto';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import { UserDto } from 'src/dto/users.dto';

export async function pageSeeder(
  db: DatabaseI,
  appIds: AppDto['id'][],
  userIds: UserDto['id'][],
) {
  console.log('running PAGES seeder');
  const fakePages = faker.helpers.multiple(
    () => generateFakePage(appIds, userIds),
    {
      count: 10,
    },
  );
  const mockPages = (
    await db
      .insert(pagesSchema)
      .values({
        name: 'mock page',
        handle: 'mock-page',
        enabled: true,
        visible: true,
        appId: appIds[0],
        createdById: userIds[0],
        index: 1,
      })
      .returning()
      .onConflictDoNothing()
  )[0];
  const pages = await db
    .insert(pagesSchema)
    .values(fakePages)
    .returning()
    .onConflictDoNothing();
  return [mockPages, ...pages];
}
