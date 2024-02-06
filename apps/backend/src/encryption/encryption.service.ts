import { BadRequestException, Injectable } from '@nestjs/common';
import { AES } from 'crypto-ts';
import { configDotenv } from 'dotenv';

@Injectable()
export class EncryptionService {
  DEFAULT_KEY = 'default-key';
  encryptData(data: string) {
    configDotenv();
    const KEY = process.env.ENCRYPTION_KEY ?? this.DEFAULT_KEY;
    if (KEY === this.DEFAULT_KEY) {
      throw new BadRequestException('Encryption key not found');
    }

    return AES.encrypt(data, KEY).toString();
    // const iv = crypto.randomBytes(IV_LENGTH);
    // const cipher = crypto.createCipheriv(ALGORITHM, new Buffer(KEY), iv);
    // return Buffer.concat([cipher.update(data), cipher.final(), iv]).toString(
    //   ENCODING,
    // );
  }
  decryptData(data: string) {
    configDotenv();
    const KEY = process.env.ENCRYPTION_KEY ?? this.DEFAULT_KEY;
    if (KEY === this.DEFAULT_KEY) {
      throw new BadRequestException('Encryption key not found');
    }

    return AES.decrypt(data, KEY).toString();
    // const binaryData = new Buffer(data, ENCODING);
    // const iv = binaryData.slice(-IV_LENGTH);
    // const encryptedData = binaryData.slice(0, binaryData.length - IV_LENGTH);
    // const decipher = crypto.createDecipheriv(ALGORITHM, new Buffer(KEY), iv);
    // return Buffer.concat([
    //   decipher.update(encryptedData),
    //   decipher.final(),
    // ]).toString();
  }
}
