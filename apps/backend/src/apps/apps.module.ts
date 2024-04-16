import { Module } from '@nestjs/common';
import { AppsService } from './apps.service';
import { AppsController } from './apps.controller';
import { PagesModule } from '../pages/pages.module';
import { ComponentsModule } from '../components/components.module';

@Module({
  imports: [PagesModule, ComponentsModule],
  controllers: [AppsController],
  providers: [AppsService],
})
export class AppsModule {}
