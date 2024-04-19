import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { EncryptionService } from './encryption.service';

@Controller('encryption')
export class EncryptionController {
  constructor(readonly encryptionService: EncryptionService) {}
  @Post()
  async encrypt(@Body('plain') plainText: string): Promise<string> {
    const encryptedText = this.encryptionService.encrypt(plainText);
    if (!encryptedText) {
      throw new HttpException(
        'Encrypted text not found: ' +
          encryptedText?.toString() +
          ' for plain text: ' +
          plainText,
        404,
      );
    }
    return encryptedText;
  }

  @Post()
  async decrypt(@Body('encrypted') plainText: string): Promise<string> {
    const encryptedText = this.encryptionService.encrypt(plainText);
    if (!encryptedText) {
      throw new HttpException(
        'Encrypted text not found: ' +
          encryptedText?.toString() +
          ' for plain text: ' +
          plainText,
        404,
      );
    }
    return encryptedText;
  }
}
