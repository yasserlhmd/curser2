import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService as AppConfigService } from '../../config/config.service';
import { UsersService } from '../../users/users.service';
import { TokenRevocationService } from '../../token-revocation/token-revocation.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

/**
 * JWT Strategy
 * Passport strategy for JWT authentication
 * Validates tokens and checks revocation status
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: AppConfigService,
    private readonly usersService: UsersService,
    private readonly tokenRevocationService: TokenRevocationService,
  ) {
    // Extract JWT config from parameter (can't use 'this' before super())
    const jwtConfig = configService.jwt;
    if (!jwtConfig.secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  /**
   * Validate JWT payload
   * Called after token is verified
   */
  async validate(payload: JwtPayload) {
    // Check if token is revoked (Redis blacklist)
    const isRevoked = await this.tokenRevocationService.isTokenRevoked(
      payload.jti,
      payload.userId,
      payload.version,
    );

    if (isRevoked) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Get user and verify token version
    const user = await this.usersService.findOneById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check token version matches user's current version
    if (user.tokenVersion !== payload.version) {
      throw new UnauthorizedException('Token version mismatch');
    }

    return user;
  }
}

