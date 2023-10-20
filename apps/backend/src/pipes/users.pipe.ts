import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodObject } from 'zod';
import { CreateUserDto, LoginUserDto } from '../dto/users.dto';

export class ValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: CreateUserDto | LoginUserDto) {
    const res = this.schema.safeParse(value);

    if (res.success) {
      return value;
    }
    throw new BadRequestException(res.error.flatten().fieldErrors);
  }
}
