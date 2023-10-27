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
 * type of user that will be on the `Request` object
 */
export type RequestUser = {
  userId: number;
  username: string;
};

export type ExpressAuthedRequest = Request & {
  user: RequestUser;
};

export type JwtToken = { token: string };

export type JwtRequest = Request & {
  user: JwtToken;
};

export type GoogleAuthedRequest = Request & {
  user: CreateUserDto | LoginUserDto | JwtToken;
};
