import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AppDto, CreateAppDb, UpdateAppDb } from '../dto/apps.dto';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { apps } from '../drizzle/schema/schema';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { PagesService } from '../pages/pages.service';
import { UserDto } from '../dto/users.dto';

@Injectable()
export class AppsService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private pagesService: PagesService,
  ) {}

  // TODO: copy app state
  async clone({
    workspaceId,
    appId,
    createdById,
  }: {
    createdById: UserDto['id'];
    workspaceId: AppDto['workspaceId'];
    appId: AppDto['id'];
  }) {
    const app = await this.findOne(workspaceId, appId);
    const newApp = await this.create({
      name: app.name + '(copy)',
      description: app.description,
      workspaceId,
      createdById: createdById,
    });
    return newApp;
  }

  async create(createAppDto: CreateAppDb) {
    const app = await this.db.transaction(async (tx) => {
      const [app] = await tx.insert(apps).values(createAppDto).returning();
      // create default page for the app
      const page = await this.pagesService.create(
        {
          name: 'page 1',
          createdById: createAppDto.createdById,
          appId: app.id,
        },
        {
          // TODO: fix the type
          // @ts-ignore
          tx: tx,
        },
      );
      return { ...app, pages: [page] };
    });

    return app;
  }

  async findAll(workspaceId: AppDto['workspaceId']) {
    const workspaceApps = await this.db.query.apps.findMany({
      where: and(eq(apps.workspaceId, workspaceId), isNull(apps.deletedAt)),
      orderBy: asc(apps.createdAt),
      with: {
        createdBy: {
          columns: {
            id: true,
            username: true,
          },
        },
        updatedBy: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    });
    return workspaceApps;
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
      with: {
        pages: true,
      },
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
