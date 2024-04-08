import { Module } from '@nestjs/common';
import { GooglesheetsController } from './googlesheets.controller';
import { GooglesheetsService } from './googlesheets.service';
import { GoogleSheetsStrategy } from './googlesheets.strategy';

@Module({
  imports: [],
  controllers: [GooglesheetsController],
  providers: [GooglesheetsService, GoogleSheetsStrategy],
})
export class GooglesheetsModule {}
