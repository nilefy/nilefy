import { faker } from '@faker-js/faker';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import { permissions } from '../../drizzle/schema/schema';
import { permissionTypes } from '../../dto/permissionsTypes';

export async function permissionsSeeder(db: DatabaseI) {
  console.log('running PERMISSIONS seeder');
  const permissionsSeed = permissionTypes.options.map((p) => ({
    name: p,
    description: faker.lorem.sentence(),
  }));

  return await db
    .insert(permissions)
    .values(permissionsSeed)
    .returning()
    .onConflictDoNothing();
}
