import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AppDto, CreateAppDb, UpdateAppDb } from '../dto/apps.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { apps } from '../drizzle/schema/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

@Injectable()
export class AppsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(createAppDto: CreateAppDb): Promise<AppDto> {
    const [app] = await this.db.insert(apps).values(createAppDto).returning();
    // note i'm using as because "state" is not infered
    return app as AppDto;
  }

  async findAll(workspaceId: AppDto['workspaceId']): Promise<AppDto[]> {
    const workspaceApps = await this.db.query.apps.findMany({
      where: and(eq(apps.workspaceId, workspaceId), isNull(apps.deletedAt)),
    });
    return workspaceApps as AppDto[];
  }

  async findOne(
    workspaceId: AppDto['workspaceId'],
    appId: AppDto['id'],
  ): Promise<AppDto> {
    const app = await this.db.query.apps.findFirst({
      where: and(
        eq(apps.id, appId),
        eq(apps.workspaceId, workspaceId),
        isNull(apps.deletedAt),
      ),
    });
    if (!app) throw new NotFoundException('app not found in this workspace');
    return app as AppDto;
  }

  async update(
    workspaceId: AppDto['workspaceId'],
    appId: AppDto['id'],
    updateAppDto: UpdateAppDb,
  ): Promise<AppDto> {
    const [app] = await this.db
      .update(apps)
      .set({ updatedAt: sql`now()`, ...updateAppDto })
      .where(
        and(
          eq(apps.id, appId),
          eq(apps.workspaceId, workspaceId),
          isNull(apps.deletedAt),
        ),
      )
      .returning();

    if (!app) throw new NotFoundException('app not found in this workspace');
    return app as AppDto;
  }

  async delete({
    workspaceId,
    appId,
    deletedById,
  }: {
    deletedById: AppDto['deletedById'];
    appId: AppDto['id'];
    workspaceId: AppDto['workspaceId'];
  }): Promise<AppDto> {
    const [app] = await this.db
      .update(apps)
      .set({ deletedAt: sql`now()`, deletedById })
      .where(
        and(
          eq(apps.id, appId),
          eq(apps.workspaceId, workspaceId),
          isNull(apps.deletedAt),
        ),
      )
      .returning();

    if (!app) throw new NotFoundException('app not found in this workspace');
    return app as AppDto;
  }
}
