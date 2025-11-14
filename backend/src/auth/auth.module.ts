import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { TokenRevocationModule } from '../token-revocation/token-revocation.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule as AppConfigModule } from '../config/config.module';
import { ConfigService as AppConfigService } from '../config/config.service';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    TokenRevocationModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule, AppConfigModule],
      useFactory: async (configService: ConfigService) => {
        const appConfigService = new AppConfigService(configService);
        const jwtConfig = appConfigService.jwt;
        if (!jwtConfig.secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

