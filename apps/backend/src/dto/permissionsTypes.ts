import z from 'zod';

export const permissionTypes = z.enum([
  'Workspaces-Read',
  'Workspaces-Write',
  'Workspaces-Delete',
  // APPS
  'Apps-Read',
  'Apps-Write',
  'Apps-Delete',
]);
