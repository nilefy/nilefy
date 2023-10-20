# Database Workflow

drizzle docs is better docs than that, here we're just documenting the workflow for new commers.

- to create/ update table all the updates should be in [src/drizzle/schema](../src/drizzle//schema/) by either creating a new file or updating an existing file(schema.ts).

- if you created new file. then you need to extend the drizzle provider to add this file as well.
    
    for example: if you created a file named `user.ts` then you need to add this file in [src/drizzle/provider](../src/drizzle/provider/) and extend the drizzle provider.

    ```ts
    // 1-
    import * as userSchema from './schema/user';

    // 2- 
    export type DatabaseI = NodePgDatabase<typeof schema && typeof userSchema>;

    // 3- 
      const db: DatabaseI = drizzle(client, { ...schema, ...userSchema });
    ```

- How to use the drizzle provider?
    the drizzle module is global so you don't need to import it in every module that needs it, just inject it directly.
  - how to inject it? for example check [user.service.ts](../src/app/user/user.service.ts) file.

    because drizzle provider is async one you need to use `@Inject`

    ```ts
    import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
    // ---------------- name of the provider ----------------
    constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}
    ```

- to prototype the database without creating migration files `pnpm db:push`

- to only generate migration files `pnpm db:generate`

- to generate migration files and apply them `pnpm db:migrate`
