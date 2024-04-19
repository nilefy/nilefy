import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { EncryptionController } from './encryption.controller';

@Module({
  providers: [EncryptionService],
  controllers: [EncryptionController],
})
export class EncryptionModule {}
