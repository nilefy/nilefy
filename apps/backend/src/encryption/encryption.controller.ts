import { Controller, Get } from '@nestjs/common';

@Controller('enc')
export class EncryptionController {
  @Get('/')
  async getEncryption(): Promise<string> {
    return 'encryption';
  }
}
