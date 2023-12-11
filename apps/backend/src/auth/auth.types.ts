import { CreateUserDto, LoginUserDto } from '../dto/users.dto';

/**
 * JWT payload type
 */
export type PayloadUser = {
  /**
   * userId
   */
  sub: number;
  username: string;
};

/**
 * type of user that will be on the `Request` object after auth
 */
export type RequestUser = {
  userId: number;
  username: string;
};

export type ExpressAuthedRequest = Request & {
  user: RequestUser;
};

export type JwtToken = { access_token: string };

export type GoogleAuthedRequest = Request & {
  user: CreateUserDto | LoginUserDto;
};
