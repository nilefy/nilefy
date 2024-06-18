import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module';
import { TConfigService } from '../evn.validation';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInGoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { DataSourcesModule } from '../data_sources/data_sources.module';
@Module({
  imports: [
    DataSourcesModule,
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
