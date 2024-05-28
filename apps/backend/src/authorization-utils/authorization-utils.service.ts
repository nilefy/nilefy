import { WorkspaceDto } from '../dto/workspace.dto';
import { AppDto } from '../dto/apps.dto';
import { DataSourceDto } from '../dto/data_sources.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserDto } from '../dto/users.dto';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import * as schema from '@nilefy/database';
import { and, eq, inArray } from 'drizzle-orm';

@Injectable()
export class AuthorizationUtilsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: schema.DatabaseI) {}

  // TODO: test this funciton
  async doesWorkspaceOwnsUsers(
    workspaceId: WorkspaceDto['id'],
    users: UserDto['id'][],
  ) {
    const inWorkspace = await this.db.query.usersToWorkspaces.findMany({
      columns: { userId: true },
      where: and(
        eq(schema.usersToWorkspaces.workspaceId, workspaceId),
        inArray(schema.usersToWorkspaces.userId, users),
      ),
    });
    if (inWorkspace.length !== users.length) {
      Logger.error({
        msg: 'workspace access users outside the workspace',
        users,
        inWorkspace,
      });
      return false;
    }
    return true;
  }
  // TODO: test this funciton
  async doesWorkspaceOwnsApps(
    workspaceId: WorkspaceDto['id'],
    apps: AppDto['id'][],
  ) {
    console.log(
      '🪵 [authorization-utils.service.ts:39] ~ token ~ \x1b[0;32mapps\x1b[0m = ',
      apps,
    );
    const inWorkspace = await this.db.query.apps.findMany({
      columns: { id: true },
      where: and(
        eq(schema.apps.workspaceId, workspaceId),
        inArray(schema.apps.id, apps),
      ),
    });
    console.log(
      '🪵 [authorization-utils.service.ts:45] ~ token ~ \x1b[0;32minWorkspace\x1b[0m = ',
      inWorkspace,
    );
    if (inWorkspace.length !== apps.length) {
      Logger.error({
        msg: 'workspace access apps outside the workspace',
        apps,
        inWorkspace,
      });
      return false;
    }
    return true;
  }
  // TODO: test this funciton
  async doesWorkspaceOwnsDatasource(
    workspaceId: WorkspaceDto['id'],
    datasources: DataSourceDto['id'][],
  ) {
    const inWorkspace = await this.db.query.workspaceDataSources.findMany({
      columns: { id: true },
      where: and(
        eq(schema.workspaceDataSources.workspaceId, workspaceId),
        inArray(schema.workspaceDataSources.id, datasources),
      ),
    });
    if (inWorkspace.length !== datasources.length) {
      Logger.error({
        msg: 'workspace access datasources outside the workspace',
        datasources,
        inWorkspace,
      });
      return false;
    }
    return true;
  }
}
