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

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WebloomTableModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // custom validation function with zod
      validate,
    }),
    DrizzleModule,
    WorkspacesModule,
    AppsModule,
    RolesModule,
  ],
})
export class AppModule {}
