import { Module } from '@nestjs/common';
import { AppsVersionsController } from './apps_versions.controller';
import { AppsVersionsService } from './apps_versions.service';

@Module({
  controllers: [AppsVersionsController],
  providers: [AppsVersionsService],
})
export class AppsVersionsModule {}
