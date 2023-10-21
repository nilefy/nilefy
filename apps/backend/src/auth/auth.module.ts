import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvSchema } from '../evn.validation';
import { ConfigService } from '@nestjs/config';
import { SignInGoogleStrategy, SignUpGoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory(configService: ConfigService<EnvSchema>) {
        return {
          // secret: configService.get('JWT_SECRET'),
          secret: '',
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SignInGoogleStrategy,
    SignUpGoogleStrategy,
    JwtStrategy,
  ],
})
export class AuthModule {}
