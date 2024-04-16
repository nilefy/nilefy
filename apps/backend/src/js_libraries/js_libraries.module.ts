import { Module } from '@nestjs/common';
import { JsLibrariesController } from './js_libraries.controller';
import { JsLibrariesService } from './js_libraries.service';

@Module({
  controllers: [JsLibrariesController],
  providers: [JsLibrariesService],
})
export class JsLibrariesModule {}
