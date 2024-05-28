import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    const res = this.schema.safeParse(value);

    if (res.success) {
      return res.data;
    }
    throw new BadRequestException(res.error.flatten().fieldErrors);
  }
}
