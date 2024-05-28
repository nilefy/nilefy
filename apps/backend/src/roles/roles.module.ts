import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { AuthorizationUtilsModule } from '../authorization-utils/authorization-utils.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
  imports: [AuthorizationUtilsModule],
})
export class RolesModule {}
