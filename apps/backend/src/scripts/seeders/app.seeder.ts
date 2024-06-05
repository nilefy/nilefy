import { generateFakeApp } from '../faker/app.faker';
import { PgTrans } from '@nilefy/database';
import { chunkArray } from '../../utils';
import { INestApplicationContext } from '@nestjs/common';
import { AppsService } from '../../apps/apps.service';
import { AppsModule } from '../../apps/apps.module';

export async function appSeeder(
  nest: INestApplicationContext,
  tx: PgTrans,
  userWorkspaceIds: [number, number][],
) {
  console.log('running APPS seeder');
  const appsService = nest
    .select(AppsModule)
    .get(AppsService, { strict: true });

  const fakeApps = userWorkspaceIds.map(([userId, workspaceId]) => {
    return generateFakeApp(userId, workspaceId);
  });

  const appsChunks = chunkArray(fakeApps, 1000);

  for (const chunk of appsChunks) {
    await Promise.all(chunk.map((u) => appsService.create(u, { tx })));
  }
}
