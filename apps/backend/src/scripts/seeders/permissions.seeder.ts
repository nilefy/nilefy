import { faker } from '@faker-js/faker';

import { permissionTypes } from '../../dto/permissionsTypes';
import { DatabaseI, permissions } from '@webloom/database';

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
