import { apps } from './apps.api';
import { pages } from './pages.api';
import { roles, permissions } from './roles.api';
import { dataSources, globalDataSource } from './dataSources.api';
import { queries } from './queries.api';
import { workspaces } from './workspaces.api';
import { auth } from './auth.api';
import { users } from './users.api';

export const api = {
  apps,
  roles,
  dataSources,
  queries,
  globalDataSource,
  pages,
  permissions,
  workspaces,
  auth,
  users,
};
