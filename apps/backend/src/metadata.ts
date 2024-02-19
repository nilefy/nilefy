/* eslint-disable */
export default async () => {
  const t = {
    ['./dto/workspace.dto']: await import('./dto/workspace.dto'),
    ['./dto/webloom_table.dto']: await import('./dto/webloom_table.dto'),
    ['./dto/apps.dto']: await import('./dto/apps.dto'),
    ['./dto/roles.dto']: await import('./dto/roles.dto'),
    ['./dto/data_sources.dto']: await import('./dto/data_sources.dto'),
    ['./data_queries/query.types']: await import('./data_queries/query.types'),
    ['./dto/data_queries.dto']: await import('./dto/data_queries.dto'),
  };
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./dto/users.dto'),
          {
            UserDto: {},
            CreateUserDto: {},
            LoginUserDto: {},
            UpdateUserDto: {},
          },
        ],
        [
          import('./dto/workspace.dto'),
          { WorkspaceDto: {}, CreateWorkspaceDto: {}, UpdateWorkspaceDto: {} },
        ],
        [
          import('./dto/webloom_table.dto'),
          {
            WebloomColumnDto: {},
            WebloomTableDto: {},
            InsertWebloomColumnDto: {},
            InsertWebloomTableDto: {},
            InsertDto: {},
          },
        ],
        [
          import('./dto/apps.dto'),
          { AppDto: {}, CreateAppDto: {}, UpdateAppDto: {} },
        ],
        [
          import('./dto/pages.dto'),
          { PageDto: {}, CreatePageDto: {}, UpdatePageDto: {} },
        ],
        [
          import('./dto/roles.dto'),
          { RolesDto: {}, RoleInsertI: {}, RoleUpdateI: {} },
        ],
        [import('./dto/permissions.dto'), { PermissionDto: {} }],
        [
          import('./dto/data_sources.dto'),
          {
            WsDataSourceDto: {},
            CreateWsDataSourceDto: {},
            UpdateWsDataSourceDto: {},
            DataSourceDto: {},
            DataSourceDb: {},
          },
        ],
        [
          import('./dto/data_queries.dto'),
          {
            RunQueryBody: {},
            AddQueryDto: {},
            UpdateQueryDto: {},
            QueryDto: {},
            DeleteDatasourceQueriesDto: {},
          },
        ],
      ],
      controllers: [
        [
          import('./auth/auth.controller'),
          {
            AuthController: {
              signUp: { type: Object },
              signIn: { type: Object },
              signInGoogleAuth: {},
              signInGoogleRedirect: {},
            },
          },
        ],
        [
          import('./users/users.controller'),
          { UsersController: { updateProfile: {} } },
        ],
        [
          import('./workspaces/workspaces.controller'),
          {
            WorkspacesController: {
              index: { type: [t['./dto/workspace.dto'].WorkspaceDto] },
              create: { type: t['./dto/workspace.dto'].WorkspaceDto },
              update: { type: t['./dto/workspace.dto'].WorkspaceDto },
            },
          },
        ],
        [
          import('./webloom_table/table.controller'),
          {
            WebloomDbController: {
              index: { type: [t['./dto/webloom_table.dto'].WebloomTableDto] },
              findOne: { type: Object },
              createTable: { type: Object },
              insertDataByTableId: {},
              deleteTable: { type: Object },
            },
          },
        ],
        [
          import('./apps/apps.controller'),
          {
            AppsController: {
              create: {},
              findAll: {},
              findOne: {},
              clone: {},
              update: { type: t['./dto/apps.dto'].AppDto },
              delete: { type: t['./dto/apps.dto'].AppDto },
            },
          },
        ],
        [
          import('./pages/pages.controller'),
          {
            PagesController: {
              create: {},
              clone: {},
              index: {},
              findOne: {},
              update: {},
              delete: {},
            },
          },
        ],
        [
          import('./roles/roles.controller'),
          {
            RolesController: {
              index: { type: [t['./dto/roles.dto'].RolesDto] },
              one: {},
              create: {},
              update: {},
              togglePermission: {},
              Delete: { type: t['./dto/roles.dto'].RolesDto },
            },
          },
        ],
        [
          import('./permissions/permissions.controller'),
          {
            PermissionsController: {
              index: {
                description:
                  'this route is for one simple reason: when the front wants to say add or remove a permission from role it needs to know its id',
              },
            },
          },
        ],
        [
          import('./data_sources/data_sources.controller'),
          {
            DataSourcesController: {
              create: { type: t['./dto/data_sources.dto'].WsDataSourceDto },
              getConnections: {
                type: [t['./dto/data_sources.dto'].WsDataSourceDto],
              },
              getOne: {},
              getWsDataSources: { type: [Object] },
              deleteConnections: {
                type: [t['./dto/data_sources.dto'].WsDataSourceDto],
              },
              deleteOne: { type: t['./dto/data_sources.dto'].WsDataSourceDto },
              update: { type: t['./dto/data_sources.dto'].WsDataSourceDto },
            },
          },
        ],
        [
          import('./data_sources/global_data_sources.controller'),
          {
            GlobalDataSourcesController: {
              add: { type: t['./dto/data_sources.dto'].DataSourceDto },
              getAll: { type: [Object] },
              getOne: { type: t['./dto/data_sources.dto'].DataSourceDto },
            },
          },
        ],
        [
          import('./data_queries/data_queries.controller'),
          {
            DataQueriesController: {
              runQuery: { type: t['./data_queries/query.types'].QueryRet },
              addQuery: { type: t['./dto/data_queries.dto'].QueryDto },
              getAppQueries: { type: [Object] },
              getQuery: { type: t['./dto/data_queries.dto'].QueryDto },
              deleteQuery: {},
              deleteDataSourceQueries: {
                type: [t['./dto/data_queries.dto'].QueryDto],
              },
              updateQuery: { type: Object },
            },
          },
        ],
      ],
    },
  };
};
