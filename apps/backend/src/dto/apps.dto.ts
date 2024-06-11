import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { apps as appsDrizzle } from '@nilefy/database';
import { createZodDto } from 'nestjs-zod';
import { pageSchema } from './pages.dto';
import { userSchema } from './users.dto';
import { componentSchema } from './components.dto';
import { querySchema } from './data_queries.dto';
import { jsQuerySchema } from './js_queries.dto';
import { jsLibrariesSchema } from './js_libraries.dto';

export const appSchema = createSelectSchema(appsDrizzle);

export const createAppDb = createInsertSchema(appsDrizzle, {
  name: (schema) => schema.name.min(1).max(100),
});
export const importAppDb = createAppDb.omit({ id: true });

export const createAppSchema = createAppDb.pick({
  name: true,
  description: true,
});

export const updateAppDb = createAppDb
  .partial()
  // we don't support move the app from workspace to another one right now if we want to support this feature this `omit` should be deleted
  .omit({ workspaceId: true })
  .extend({
    updatedById: z.number(),
  });

export const updateAppSchema = createAppSchema.partial();

// export type AppDto = z.infer<typeof appSchema>;
/**
 * insert in the db interface
 */
export type CreateAppDb = z.infer<typeof createAppDb>;
export type ImportAppDb = z.infer<typeof importAppDb>;
/**
 * API insert interface
 */
// export type CreateAppDto = z.infer<typeof createAppSchema>;
export type UpdateAppDb = z.infer<typeof updateAppDb>;
// export type UpdateAppDto = z.infer<typeof updateAppSchema>;

export class AppDto extends createZodDto(appSchema) {}
export class CreateAppDto extends createZodDto(createAppSchema) {}
export class UpdateAppDto extends createZodDto(updateAppSchema) {}

export const createAppRetSchema = appSchema.extend({
  pages: z.array(pageSchema),
});
export class CreateAppRetDto extends createZodDto(createAppRetSchema) {}

export const appRetSchema = appSchema.extend({
  pages: z.array(
    pageSchema.pick({
      id: true,
      name: true,
      handle: true,
      index: true,
      enabled: true,
      visible: true,
    }),
  ),
  defaultPage: pageSchema.extend({
    tree: z.record(z.string(), z.unknown()),
  }),
  createdBy: userSchema
    .pick({
      id: true,
      username: true,
    })
    .nullable(),
  updatedBy: userSchema
    .pick({
      id: true,
      username: true,
    })
    .nullable(),
  onBoardingCompleted: z.boolean(),
});

export const appExportSchema = appSchema
  .pick({
    name: true,
    description: true,
  })
  .extend({
    version: z.string(),
    pages: z.array(
      pageSchema
        .pick({
          id: true,
          name: true,
          handle: true,
          index: true,
          enabled: true,
          visible: true,
        })
        .extend({
          tree: z.array(
            componentSchema
              .omit({
                createdAt: true,
                createdById: true,
                deletedById: true,
                updatedAt: true,
                updatedById: true,
              })
              .extend({
                level: z.number(),
              }),
          ),
        }),
    ),
    queries: z.array(
      querySchema
        .pick({
          id: true,
          query: true,
          triggerMode: true,
          baseDataSourceId: true,
        })
        .extend({
          dataSourceId: z.number().nullable(),
        }),
    ),
    jsQueries: z.array(
      jsQuerySchema.pick({
        id: true,
        query: true,
        settings: true,
        triggerMode: true,
      }),
    ),
    jsLibs: z.array(
      jsLibrariesSchema.pick({
        id: true,
        url: true,
      }),
    ),
  });

export type AppExportSchema = z.infer<typeof appExportSchema>;

export class AppRetDto extends createZodDto(appRetSchema) {}

export const appsRetSchema = appSchema.extend({
  createdBy: userSchema
    .pick({
      id: true,
      username: true,
    })
    .nullable(),
  updatedBy: userSchema
    .pick({
      id: true,
      username: true,
    })
    .nullable(),
  page: pageSchema.pick({
    id: true,
    name: true,
  }),
});

export class AppsRetDto extends createZodDto(appsRetSchema) {}
