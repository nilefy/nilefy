import { ConfigService } from '@nestjs/config';
import { TConfigService } from '../evn.validation';

import { dbConnect } from '@webloom/database';

export const DrizzleAsyncProvider = 'drizzleProvider';

export const drizzleProvider = {
  provide: DrizzleAsyncProvider,
  inject: [ConfigService],
  useFactory: async (configService: TConfigService) => {
    return (await dbConnect(configService.get('DB_URL')))[0];
  },
  exports: [DrizzleAsyncProvider],
};
