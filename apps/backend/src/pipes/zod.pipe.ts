import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodObject } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: unknown) {
    const res = this.schema.safeParse(value);

    if (res.success) {
      return res.data;
    }
    throw new BadRequestException(res.error.flatten().fieldErrors);
  }
}

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(
    value: any,
    //  metadata: ArgumentMetadata // to be used for further validation
  ) {
    const oneKb = 1000;
    const maxSize = oneKb * 100;
    return value.size <= maxSize;
  }
}
