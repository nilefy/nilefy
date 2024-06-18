import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AppDto,
  AppExportSchema,
  AppRetDto,
  AppsRetDto,
  CreateAppDb,
  CreateAppRetDto,
  UpdateAppDb,
} from '../dto/apps.dto';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { and, asc, eq, sql } from 'drizzle-orm';
import { PagesService } from '../pages/pages.service';
import { UserDto } from '../dto/users.dto';
import {
  PgTrans,
  apps,
  DatabaseI,
  pages,
  components,
  queries as drizzleQueries,
  users,
} from '@nilefy/database';
import { ComponentsService } from '../components/components.service';
import { alias } from 'drizzle-orm/pg-core';
import { PageDto } from '../dto/pages.dto';
import { DataQueriesService } from '../data_queries/data_queries.service';
import { JsQueriesService } from '../js_queries/js_queries.service';
import { JsLibrariesService } from '../js_libraries/js_libraries.service';

@Injectable()
export class AppsService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private pagesService: PagesService,
    private componentsService: ComponentsService,
    private queriesService: DataQueriesService,
    private jsQueriesService: JsQueriesService,
    private jsLibsService: JsLibrariesService,
  ) {}

  async clone({
    workspaceId,
    appId,
    createdById,
  }: {
    createdById: UserDto['id'];
    workspaceId: AppDto['workspaceId'];
    appId: AppDto['id'];
  }): Promise<Omit<CreateAppRetDto, 'pages'>> {
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

  // TODO: document this function
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

  async create(
    createAppDto: CreateAppDb,
    options?: { tx?: PgTrans },
  ): Promise<CreateAppRetDto> {
    return await (options?.tx
      ? this.createHelper(createAppDto, options.tx)
      : this.db.transaction(async (tx) => {
          return await this.createHelper(createAppDto, tx);
        }));
  }

  private async createHelper(
    createAppDto: CreateAppDb,
    tx: PgTrans,
  ): Promise<CreateAppRetDto> {
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
  }

  async findAll(workspaceId: AppDto['workspaceId']): Promise<AppsRetDto[]> {
    const workspaceApps = await this.db.query.apps.findMany({
      where: and(eq(apps.workspaceId, workspaceId)),
      orderBy: asc(apps.createdAt),
      with: {
        pages: {
          // TODO: if we gonna have default page concept update this to get default page instead of first page
          orderBy: asc(pages.index),
          limit: 1,
          columns: {
            id: true,
            name: true,
          },
        },
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
    return workspaceApps.map((a) => ({
      ...a,
      page: a.pages[0],
    }));
  }

  /**
   * @returns get application with its default page which is the first page or page with certain id
   */
  async findOne(
    currentUser: UserDto['id'],
    workspaceId: AppDto['workspaceId'],
    appId: AppDto['id'],
    pageId?: PageDto['id'],
  ): Promise<AppRetDto> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, currentUser),
      columns: {
        id: true,
        onboardingCompleted: true,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const app = await this.db.query.apps.findFirst({
      where: and(eq(apps.id, appId), eq(apps.workspaceId, workspaceId)),
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
      // load certain page if provided other than that load default page
      pageId ? pageId : app.pages[0].id,
    );
    if (!defaultPage) {
      throw new BadRequestException('page not found');
    }
    return {
      ...app,
      onBoardingCompleted: user.onboardingCompleted ?? false,
      defaultPage,
    };
  }

  async update(
    workspaceId: AppDto['workspaceId'],
    appId: AppDto['id'],
    updateAppDto: UpdateAppDb,
  ): Promise<AppDto> {
    const [app] = await this.db
      .update(apps)
      .set({ updatedAt: sql`now()`, ...updateAppDto })
      .where(and(eq(apps.id, appId), eq(apps.workspaceId, workspaceId)))
      .returning();

    if (!app) throw new NotFoundException('app not found in this workspace');
    return app as AppDto;
  }

  async delete({
    workspaceId,
    appId,
  }: {
    appId: AppDto['id'];
    workspaceId: AppDto['workspaceId'];
  }): Promise<AppDto> {
    const [app] = await this.db
      .delete(apps)
      .where(and(eq(apps.id, appId), eq(apps.workspaceId, workspaceId)))
      .returning();

    if (!app) throw new NotFoundException('app not found in this workspace');
    return app as AppDto;
  }

  async exportAppJSON(
    currentUser: UserDto['id'],
    workspaceId: AppDto['workspaceId'],
    appId: AppDto['id'],
  ): Promise<AppExportSchema> {
    const app = await this.findOne(currentUser, workspaceId, appId);
    const appPages = app.pages;
    const pagesPromise = Promise.all(
      appPages.map((p) => this.componentsService.getComponentsForPage(p.id)),
    );
    const [pages, queries, jsQueries, jsLibs] = await Promise.all([
      pagesPromise,
      this.queriesService.getAppQueries(app.id),
      this.jsQueriesService.index(app.id),
      this.jsLibsService.index(app.id),
    ]);
    return {
      // TODO: hoist versions in global scope
      version: '0.0.1',
      name: app.name,
      description: app.description,
      pages: pages.map((tree, i) => ({
        ...appPages[i],
        tree: tree.map((c) => ({
          id: c.id,
          type: c.type,
          level: c.level,
          col: c.col,
          row: c.row,
          props: c.props,
          rowsCount: c.rowsCount,
          columnsCount: c.columnsCount,
          parentId: c.parentId,
          pageId: c.pageId,
        })),
      })),
      queries: queries.map((q) => ({
        id: q.id,
        query: q.query,
        triggerMode: q.triggerMode,
        dataSourceId: q.dataSource?.id ?? null,
        baseDataSourceId: q.baseDataSource.id,
      })),
      jsQueries: jsQueries.map((q) => ({
        id: q.id,
        query: q.query,
        triggerMode: q.triggerMode,
        settings: q.settings,
      })),
      jsLibs: jsLibs.map((l) => ({
        id: l.id,
        url: l.url,
      })),
    };
  }

  // TODO: handle case where datasource doesn't exist
  async importAppJSON(
    currentUser: number,
    workspaceId: number,
    appData: AppExportSchema,
  ) {
    return await this.db.transaction(async (tx) => {
      const [app] = await tx
        .insert(apps)
        .values({
          name: appData.name + 'from json',
          description: appData.description,
          workspaceId: workspaceId,
          createdById: currentUser,
        })
        .returning();
      const appId = app.id;
      const createdById = app.createdById;
      const pages = await this.pagesService.createWithoutDefaultRoot(
        appData.pages.map((p) => ({
          appId: appId,
          createdById,
          handle: p.handle,
          index: p.index,
          name: p.name,
          enabled: p.enabled,
          visible: p.visible,
        })),
        { tx },
      );
      await Promise.all([
        this.componentsService.create(
          appData.pages.flatMap((p, i) =>
            p.tree.map((c) => ({ ...c, pageId: pages[i].id, createdById })),
          ),
          { tx },
        ),
        // TODO: handle case where datasource might not exist in this workspace or doesn't exist at all
        appData.queries.length > 0
          ? this.queriesService.insert(
              appData.queries.map((q) => ({
                ...q,
                appId,
                dataSourceId: null,
                createdById,
              })),
              { tx },
            )
          : undefined,
        appData.jsQueries.length > 0
          ? this.jsQueriesService.insert(
              appData.jsQueries.map((q) => ({
                ...q,
                appId,
                createdById,
              })),
              { tx },
            )
          : undefined,
        appData.jsLibs.length > 0
          ? this.jsLibsService.insert(
              appData.jsLibs.map((l) => ({
                ...l,
                appId,
                createdById,
              })),
              { tx },
            )
          : undefined,
      ]);
      return app;
    });
  }
}
