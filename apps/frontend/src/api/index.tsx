import { apps } from './apps.api';
import { pages } from './pages.api';
import { roles, permissions } from './roles.api';
import { dataSources, globalDataSource } from './dataSources.api';
import { queries } from './queries.api';
import { workspaces } from './workspaces.api';

export const api = {
  apps,
  roles,
  dataSources,
  queries,
  globalDataSource,
  pages,
  permissions,
  workspaces,
};
