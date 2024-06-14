import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './evn.validation';
import { DrizzleModule } from './drizzle/drizzle.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { WebloomTableModule } from './webloom_table/table.module';
import { AppsModule } from './apps/apps.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PagesModule } from './pages/pages.module';
import { ComponentsModule } from './components/components.module';
import { EventsModule } from './events/events.module';
import { DataSourcesModule } from './data_sources/data_sources.module';
import { DataQueriesModule } from './data_queries/data_queries.module';
import { EmailModule } from './email/email.module';
import { JsQueriesModule } from './js_queries/js_queries.module';
import { JsLibrariesModule } from './js_libraries/js_libraries.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthorizationUtilsService } from './authorization-utils/authorization-utils.service';
import { AuthorizationUtilsModule } from './authorization-utils/authorization-utils.module';
import { InvitesModule } from './invites/invites.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'frontend', 'dist'),
      exclude: ['/api/(.*)'],
    }),
    AuthModule,
    UsersModule,
    WebloomTableModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // custom validation function with zod
      validate,
      ignoreEnvFile: true,
    }),
    DrizzleModule,
    WorkspacesModule,
    AppsModule,
    RolesModule,
    PermissionsModule,
    PagesModule,
    ComponentsModule,
    EventsModule,
    DataSourcesModule,
    DataQueriesModule,
    EmailModule,
    JsQueriesModule,
    JsLibrariesModule,
    AuthorizationUtilsModule,
    InvitesModule,
  ],
  providers: [AuthorizationUtilsService],
})
export class AppModule {}
