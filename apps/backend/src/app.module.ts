import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './evn.validation';
import { DrizzleModule } from './drizzle/drizzle.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { TablecxModule } from './tablecx/tablecx.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TablecxModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // custom validation function with zod
      validate,
    }),
    DrizzleModule,
    WorkspacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
