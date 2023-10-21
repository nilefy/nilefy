import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodObject } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: unknown) {
    const res = this.schema.safeParse(value);

    if (res.success) {
      return value;
    }
    throw new BadRequestException(res.error.flatten().fieldErrors);
  }
}
