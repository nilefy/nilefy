import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    Logger.error({
      exception,
      path: ctx.getRequest().url,
      stack: (exception as Error).stack,
    });
    super.catch(exception, host);
  }
}
