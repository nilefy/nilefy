/* eslint-disable */
export default async () => {
    const t = {
        ["./dto/users.dto"]: await import("./dto/users.dto"),
        ["./dto/workspace.dto"]: await import("./dto/workspace.dto"),
        ["./dto/webloom_table.dto"]: await import("./dto/webloom_table.dto"),
        ["./dto/apps.dto"]: await import("./dto/apps.dto"),
        ["./dto/pages.dto"]: await import("./dto/pages.dto"),
        ["./dto/roles.dto"]: await import("./dto/roles.dto"),
        ["./dto/permissions.dto"]: await import("./dto/permissions.dto"),
        ["./dto/data_sources.dto"]: await import("./dto/data_sources.dto"),
        ["./data_queries/query.types"]: await import("./data_queries/query.types"),
        ["./dto/data_queries.dto"]: await import("./dto/data_queries.dto")
    };
    return { "@nestjs/swagger": { "models": [[import("./dto/users.dto"), { "UserDto": {}, "CreateUserDto": {}, "LoginUserDto": {}, "UpdateUserDto": {}, "UpdateUserDb": {}, "UpdateUserRetDto": {} }], [import("./dto/workspace.dto"), { "WorkspaceDto": {}, "CreateWorkspaceDto": {}, "UpdateWorkspaceDto": {} }], [import("./dto/webloom_table.dto"), { "WebloomColumnDto": {}, "WebloomTableDto": {}, "InsertWebloomColumnDto": {}, "InsertWebloomTableDto": {}, "InsertDto": {} }], [import("./dto/pages.dto"), { "PageDto": {}, "CreatePageDto": {}, "UpdatePageDto": {}, "CreatePageRetDto": {} }], [import("./dto/apps.dto"), { "AppDto": {}, "CreateAppDto": {}, "UpdateAppDto": {}, "CreateAppRetDto": {}, "AppRetDto": {}, "AppsRetDto": {} }], [import("./dto/roles.dto"), { "RolesDto": {}, "RoleInsertI": {}, "RoleUpdateI": {} }], [import("./dto/permissions.dto"), { "PermissionDto": {} }], [import("./dto/data_sources.dto"), { "WsDataSourceDto": {}, "CreateWsDataSourceDto": {}, "UpdateWsDataSourceDto": {}, "DataSourceDto": {}, "DataSourceDb": {}, "DataSourceConnectionDto": {}, "WsDataSourcesDto": {} }], [import("./dto/data_queries.dto"), { "RunQueryBody": {}, "AddQueryDto": {}, "UpdateQueryDto": {}, "QueryDto": {}, "DeleteDatasourceQueriesDto": {}, "AppQueriesDto": {} }]], "controllers": [[import("./auth/auth.controller"), { "AuthController": { "signUp": {}, "signIn": { type: Object }, "signInGoogleAuth": {}, "signInGoogleRedirect": {}, "confirm": {} } }], [import("./users/users.controller"), { "UsersController": { "updateProfile": { type: t["./dto/users.dto"].UpdateUserRetDto } } }], [import("./workspaces/workspaces.controller"), { "WorkspacesController": { "index": { type: [t["./dto/workspace.dto"].WorkspaceDto] }, "create": { type: t["./dto/workspace.dto"].WorkspaceDto }, "update": { type: t["./dto/workspace.dto"].WorkspaceDto } } }], [import("./webloom_table/table.controller"), { "WebloomDbController": { "index": { type: [t["./dto/webloom_table.dto"].WebloomTableDto] }, "findOne": { type: Object }, "createTable": { type: Object }, "insertDataByTableId": {}, "deleteTable": { type: Object } } }], [import("./apps/apps.controller"), { "AppsController": { "create": { type: t["./dto/apps.dto"].CreateAppRetDto }, "findAll": { type: [t["./dto/apps.dto"].AppsRetDto] }, "exportOne": {}, "importOne": {}, "findOne": { type: t["./dto/apps.dto"].AppRetDto }, "clone": { type: t["./dto/apps.dto"].CreateAppRetDto }, "update": { type: t["./dto/apps.dto"].AppDto }, "delete": { type: t["./dto/apps.dto"].AppDto } } }], [import("./pages/pages.controller"), { "PagesController": { "create": { type: t["./dto/pages.dto"].CreatePageRetDto }, "clone": { type: [t["./dto/pages.dto"].PageDto] }, "index": { type: [t["./dto/pages.dto"].PageDto] }, "findOne": { type: t["./dto/pages.dto"].CreatePageRetDto }, "update": { type: [t["./dto/pages.dto"].PageDto] }, "delete": { type: [t["./dto/pages.dto"].PageDto] } } }], [import("./roles/roles.controller"), { "RolesController": { "index": { type: [t["./dto/roles.dto"].RolesDto] }, "one": {}, "create": {}, "update": {}, "togglePermission": {}, "Delete": { type: t["./dto/roles.dto"].RolesDto } } }], [import("./permissions/permissions.controller"), { "PermissionsController": { "index": { description: "this route is for one simple reason: when the front wants to say add or remove a permission from role it needs to know its id", type: [t["./dto/permissions.dto"].PermissionDto] } } }], [import("./data_sources/data_sources.controller"), { "DataSourcesController": { "create": { type: t["./dto/data_sources.dto"].WsDataSourceDto }, "getConnections": { type: [t["./dto/data_sources.dto"].WsDataSourceDto] }, "getOne": { type: t["./dto/data_sources.dto"].DataSourceConnectionDto }, "getWsDataSources": { type: [t["./dto/data_sources.dto"].WsDataSourcesDto] }, "deleteConnections": { type: [t["./dto/data_sources.dto"].WsDataSourceDto] }, "deleteOne": { type: t["./dto/data_sources.dto"].WsDataSourceDto }, "update": { type: t["./dto/data_sources.dto"].WsDataSourceDto } } }], [import("./data_sources/global_data_sources.controller"), { "GlobalDataSourcesController": { "add": { type: t["./dto/data_sources.dto"].DataSourceDto }, "getAll": { type: [Object] }, "getOne": { type: t["./dto/data_sources.dto"].DataSourceDto } } }], [import("./data_queries/data_queries.controller"), { "DataQueriesController": { "runQuery": { type: t["./data_queries/query.types"].QueryRet }, "addQuery": { type: t["./dto/data_queries.dto"].QueryDto }, "getAppQueries": { type: [t["./dto/data_queries.dto"].AppQueriesDto] }, "getQuery": { type: t["./dto/data_queries.dto"].QueryDto }, "deleteQuery": {}, "deleteDataSourceQueries": { type: [t["./dto/data_queries.dto"].QueryDto] }, "updateQuery": { type: Object } } }]] } };
};