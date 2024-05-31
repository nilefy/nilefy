import { Module } from '@nestjs/common';
import { AuthorizationUtilsService } from './authorization-utils.service';

@Module({
  providers: [AuthorizationUtilsService],
  exports: [AuthorizationUtilsService],
})
export class AuthorizationUtilsModule {}
