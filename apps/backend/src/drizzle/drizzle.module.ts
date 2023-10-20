import { Global, Module } from '@nestjs/common';
import { DrizzleAsyncProvider, drizzleProvider } from './drizzle.provider';

@Global()
@Module({
  providers: [drizzleProvider],
  exports: [DrizzleAsyncProvider],
})
export class DrizzleModule {}
