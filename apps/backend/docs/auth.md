# Authentication Feature

The authentication feature provides secure user authentication using Google OAuth 2.0. This documentation explains the usage of Passport.js with the Google OAuth2 and Passport-JWT strategies.

## Google OAuth
Google OAuth 2.0 is used for user authentication. This allows users to sign in/up using their existing Google accounts, providing a secure authentication process.

## Passport.js
Passport is authentication middleware for Node.js. It simplifies the authentication process and supports various authentication strategies. With Passport.js, we can easily integrate Google OAuth 2.0 and JWT authentication.

### Passport-Google-OAuth2 Strategy
The Passport-Google-OAuth2 strategy is implemented to enable authentication using Google accounts. This strategy handles the OAuth flow, allowing users to grant our application access to their Google account information securely.

### Passport-JWT Strategy
Passport-JWT is used to generate JSON Web Tokens (JWT) for authenticated users. This strategy ensures the integrity and authenticity of the tokens.

## Authentication Flow
1. Users click on the "Sign In with Google" button.
2. They are redirected to the Google authentication page, where they enter their credentials.
3. Once authenticated, Google redirects the user back to the application's callback URL.
4. The application exchanges the authorization code obtained from Google for an access token and a refresh token.
5. The access token is then used to fetch user information from Google.
6. A JWT token containing relevant user information is generated and signed with a secret key.
7. The token is returned to the user and stored on the client-side.
8. For subsequent requests, the client includes the JWT token in the Authorization header.
9. The server verifies the JWT token's authenticity and extracts the user information from it.

## Dependencies 
- @nestjs/passport: "^10.0.2"
- passport-google-oauth20: "^2.0.0"
- passport-jwt: "^4.0.1"

## Code Examples

### Passport-Google-OAuth2 Strategy
```ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

// setting up for sign in
export class SignInGoogleStrategy extends PassportStrategy(
  Strategy,
  'google_login',
) {
  private configService: TConfigService;

  constructor(configService: ConfigService<EnvSchema, true>) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/login/google-redirect',
      scope: ['email', 'profile'],
    });
    this.configService = configService;
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // create user based on profile
    done(null, user);
  }
}

// Google guard
import { AuthGuard } from '@nestjs/passport';
export class SignInGoogleOAuthGuard extends AuthGuard('google_login') {
  constructor() {
    super({ accessType: 'offline' });
  }
}

// auth controller
@UseGuards(SignInGoogleOAuthGuard)
@Get('login/google')
signInGoogleAuth() {}

@UseGuards(SignInGoogleOAuthGuard)
@Get('login/google-redirect')
async signInGoogleRedirect(@Req() req: GoogleAuthedRequest) {}
```

### Passport-JWT Strategy
```ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy) {
  private configService: TConfigService;

  constructor(configService: ConfigService<EnvSchema, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
    this.configService = configService;
  }

  // get the decoded JSON from passport
  async validate(payload: PayloadUser): Promise<RequestUser> {}
}

// JWT guard
import { AuthGuard } from '@nestjs/passport';
export class JwtGuard extends AuthGuard('jwt') {}

// auth controller
@UseGuards(JwtGuard)
@Get('main')
main() {}
```