import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInGoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { TConfigService } from '../evn.validation';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    EmailModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory(configService: TConfigService) {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SignInGoogleStrategy, JwtStrategy],
})
export class AuthModule {}
