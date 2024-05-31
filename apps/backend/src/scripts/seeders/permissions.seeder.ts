import { faker } from '@faker-js/faker';

import { permissionsTypes } from '@nilefy/permissions';
import { DatabaseI, permissions } from '@nilefy/database';

export async function permissionsSeeder(db: DatabaseI) {
  console.log('running PERMISSIONS seeder');
  const permissionsSeed = permissionsTypes.options.map((p) => ({
    name: p,
    description: faker.lorem.sentence(),
  }));

  return await db
    .insert(permissions)
    .values(permissionsSeed)
    .returning()
    .onConflictDoNothing();
}
