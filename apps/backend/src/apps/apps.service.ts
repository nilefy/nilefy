import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AppDto,
  AppRetDto,
  AppsRetDto,
  CreateAppDb,
  CreateAppRetDto,
  UpdateAppDb,
} from '../dto/apps.dto';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { PagesService } from '../pages/pages.service';
import { UserDto } from '../dto/users.dto';
import {
  PgTrans,
  apps,
  DatabaseI,
  pages,
  components,
  queries as drizzleQueries,
} from '@webloom/database';
import { alias } from 'drizzle-orm/pg-core';
import { PageDto } from '../dto/pages.dto';

@Injectable()
export class AppsService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private pagesService: PagesService,
  ) {}

  async clone({
    workspaceId,
    appId,
    createdById,
  }: {
    createdById: UserDto['id'];
    workspaceId: AppDto['workspaceId'];
    appId: AppDto['id'];
  }): Promise<CreateAppRetDto> {
    const newApp = await this.db.transaction(async (tx) => {
      const apps2 = alias(apps, 'apps2');
      const createAppSql = sql<AppDto>`
      insert into ${apps} ("created_by_id", "name", "description", "workspace_id")
      select ${createdById}, ${apps2.name} || ' (copy)', ${apps2.description}, ${apps2.workspaceId}
      from ${apps} as ${apps2}
      where ${apps2.id} = ${appId} and ${apps2.workspaceId} = ${workspaceId}
      returning *;
    `;
      const newApp = (await tx.execute(createAppSql))
        .rows[0] as unknown as AppDto;

      const queries2 = alias(drizzleQueries, 'q2');
      const copyQueries = sql`
      insert into ${drizzleQueries} (app_id, created_by_id, id, query, trigger_mode, data_source_id )
      select ${newApp.id}, ${createdById}, ${queries2.id}, ${queries2.query}, ${queries2.triggerMode}, ${queries2.dataSourceId}
      from ${drizzleQueries} as ${queries2}
      where ${queries2.appId} = ${appId};
      `;
      await tx.execute(copyQueries);

      const appPages = (
        await tx.query.apps.findFirst({
          where: and(eq(apps.id, appId), eq(apps.workspaceId, workspaceId)),
          columns: {
            id: true,
          },
          with: {
            pages: {
              columns: {
                id: true,
              },
            },
          },
        })
      )?.pages;
      if (!appPages) {
        throw new InternalServerErrorException();
      }
      await Promise.all(
        appPages.map(({ id }) => {
          return this.copyPageToAnotherPage(
            tx,
            appId,
            newApp.id,
            id,
            createdById,
          );
        }),
      );

      return newApp;
    });
    return newApp;
  }

  private async copyPageToAnotherPage(
    tx: PgTrans,
    oldAppId: number,
    newAppId: number,
    oldPageId: number,
    createdById: number,
  ) {
    const pages2 = alias(pages, 'p2');
    const copyPage = sql`
      insert into ${pages} (app_id, created_by_id, handle, name, disabled, visible, index)
      select ${newAppId}, ${createdById}, ${pages2.handle}, ${pages2.name}, ${pages2.enabled}, ${pages2.visible}, ${pages2.index}
      from ${pages} as ${pages2}
      where ${pages2.id} = ${oldPageId} and ${pages2.appId} = ${oldAppId}
      returning id;
      `;
    const newPage = (await tx.execute(copyPage)).rows[0] as unknown as {
      id: PageDto['id'];
    };
    if (!newPage) {
      throw new InternalServerErrorException();
    }
    const components2 = alias(components, 'c2');
    const copyComponents = sql`
      insert into ${components} (created_by_id, id, type, props, parent_id, col, row, columns_count, rows_count, page_id)
      select ${createdById}, ${components2.id}, ${components2.type}, ${components2.props}, ${components2.parentId} , ${components2.col}, ${components2.row}, ${components2.columnsCount}, ${components2.rowsCount}, ${newPage.id}
      from ${components} as ${components2}
      where ${components2.pageId} = ${oldPageId}
      order by ${components2.createdAt} ASC;
      `;
    await tx.execute(copyComponents);
    return newPage;
  }

  async create(createAppDto: CreateAppDb): Promise<CreateAppRetDto> {
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
          tx: tx,
        },
      );
      return { ...app, pages: [page] };
    });

    return app;
  }

  async findAll(workspaceId: AppDto['workspaceId']): Promise<AppsRetDto[]> {
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
  ): Promise<AppRetDto> {
    const app = await this.db.query.apps.findFirst({
      where: and(
        eq(apps.id, appId),
        eq(apps.workspaceId, workspaceId),
        isNull(apps.deletedAt),
      ),
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
        pages: {
          orderBy: asc(pages.index),
          columns: {
            id: true,
            name: true,
            handle: true,
            index: true,
            enabled: true,
            visible: true,
          },
        },
      },
    });
    if (!app) throw new NotFoundException('app not found in this workspace');
    if (app.pages.length < 1)
      throw new BadRequestException(
        "app must has at least one page what's going on",
      );
    // TODO: for now i get the first page as the default but needs to add default page concept to the database
    const defaultPage = await this.pagesService.findOne(
      app.id,
      app.pages[0].id,
    );
    return { ...app, defaultPage };
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
