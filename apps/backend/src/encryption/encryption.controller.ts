import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { DecryptStringDto, EncryptStringDto } from '../dto/encryption.dto';

@Controller('encryption')
export class EncryptionController {
  constructor(readonly encryptionService: EncryptionService) {}
  @Post('encrypt')
  async encrypt(@Body() encryptStringDto: EncryptStringDto): Promise<string> {
    console.log('encryptStringDto', encryptStringDto);
    const encryptedText = this.encryptionService.encrypt(
      encryptStringDto.plain?.toString(),
    );
    if (!encryptedText) {
      throw new InternalServerErrorException(
        'An error has occured while encrypting the text',
      );
    }
    return encryptedText;
  }

  @Post('decrypt')
  async decrypt(@Body() decryptStringDto: DecryptStringDto): Promise<string> {
    console.log(decryptStringDto);
    const encryptedText = this.encryptionService.decrypt(
      decryptStringDto.ciphered,
    );
    if (!encryptedText) {
      throw new InternalServerErrorException(
        'An error has occured while decrypting the text',
      );
    }
    return encryptedText;
  }
}
