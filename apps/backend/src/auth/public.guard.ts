import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * use the `public` guard if the controller has global auth guard and want to execlude some endpoints
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
