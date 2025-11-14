import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

/**
 * Token Revocation Service
 * Handles token blacklisting using Redis
 * Gracefully degrades if Redis is unavailable
 */
@Injectable()
export class TokenRevocationService {
  constructor(private redisService: RedisService) {}

  /**
   * Revoke a specific token
   * @param jti - JWT ID (token identifier)
   * @param userId - User ID
   * @param expiresAt - Token expiration date
   * @param reason - Revocation reason
   */
  async revokeToken(
    jti: string,
    userId: number,
    expiresAt: Date,
    reason: string = 'logout',
  ): Promise<void> {
    if (!this.redisService.isAvailable()) {
      return; // Graceful degradation
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = Math.floor(expiresAt.getTime() / 1000);
    const ttl = Math.max(0, exp - now);

    if (ttl <= 0) {
      return; // Token already expired
    }

    const tokenData = {
      userId,
      expiresAt: expiresAt.toISOString(),
      reason,
      revokedAt: new Date().toISOString(),
    };

    await this.redisService.setex(
      `revoked_token:${jti}`,
      ttl,
      JSON.stringify(tokenData),
    );
  }

  /**
   * Check if token is revoked (Redis blacklist check)
   * Note: Token version check is handled in JWT strategy
   * @param jti - JWT ID
   * @param userId - User ID
   * @param tokenVersion - Token version
   * @returns True if token is revoked
   */
  async isTokenRevoked(jti: string, userId: number, tokenVersion: number): Promise<boolean> {
    // Version check is handled in JWT strategy
    // This checks Redis blacklist
    if (!this.redisService.isAvailable()) {
      return false; // If Redis unavailable, rely on version check only
    }

    const exists = await this.redisService.exists(`revoked_token:${jti}`);
    return exists === 1;
  }
}

