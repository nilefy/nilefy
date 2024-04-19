import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from 'src/evn.validation';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  constructor(private configService: ConfigService<EnvSchema, true>) {
    this.KEY = this.configService.get('SECRET_KEY');
  }
  private encoding: BufferEncoding = 'hex';
  private KEY: string;
  splitEncryptedText(encryptedText: string) {
    return {
      ivString: encryptedText.slice(0, 32),
      encryptedDataString: encryptedText.slice(32),
    };
  }
  encrypt(plaintext: string) {
    try {
      const iv = crypto.randomBytes(16);
      const key_in_bytes = Buffer.from(this.KEY, 'base64');
      const cipher = crypto.createCipheriv('aes-256-cbc', key_in_bytes, iv);

      const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf-8'),
        cipher.final(),
      ]);

      return iv.toString(this.encoding) + encrypted.toString(this.encoding);
    } catch (e) {
      throw new HttpException(
        'an error has occured/ encryption service: ' + e + '. KEY: ' + this.KEY,
        404,
      );
    }
  }
  decrypt(cipherText: string) {
    const { encryptedDataString, ivString } =
      this.splitEncryptedText(cipherText);

    try {
      const iv = Buffer.from(ivString, this.encoding);
      const encryptedText = Buffer.from(encryptedDataString, this.encoding);

      const key_in_bytes = Buffer.from(this.KEY, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-cbc', key_in_bytes, iv);

      const decrypted = decipher.update(encryptedText);
      return Buffer.concat([decrypted, decipher.final()]).toString();
    } catch (e) {
      throw new InternalServerErrorException(
        'an error has occured/ decryption service: ' + e,
      );
    }
  }
}
