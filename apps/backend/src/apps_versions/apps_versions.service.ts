import { Inject, Injectable } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '@nilefy/database';
import { AppVersionDto, CreateAppVersionDto } from '../dto/apps_versions.dto';
import { WorkspaceDto } from '../dto/workspace.dto';
import { AppDto } from '../dto/apps.dto';

@Injectable()
export class AppsVersionsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(
    {
      workspaceId,
      appId,
      createdById,
    }: {
      workspaceId: WorkspaceDto['id'];
      appId: AppDto['id'];
      createdById: AppVersionDto['createdById'];
    },
    { name, versionFromId }: CreateAppVersionDto,
  ) {
    const app = await this.cloneApp({
      workspaceId,
      appId,
      versionFromId,
    });
    // TODO
  }

  async cloneApp({
    workspaceId,
    appId,
    versionFromId,
  }: {
    workspaceId: WorkspaceDto['id'];
    appId: AppDto['id'] | null;
    versionFromId: CreateAppVersionDto['versionFromId'];
  }) {
    // TODO
  }
}
