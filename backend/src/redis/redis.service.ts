import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import Redis from 'ioredis';

/**
 * Redis Service
 * Handles Redis connection and operations
 * Gracefully degrades if Redis is unavailable
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const redisConfig = this.configService.redis;
      this.client = new Redis({
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password,
        db: redisConfig.db,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on('connect', () => {
        if (this.configService.isDevelopment()) {
          console.log('✅ Redis connected successfully');
        }
      });

      this.client.on('error', (err) => {
        console.warn('⚠️ Redis connection error:', err.message);
      });
    } catch (error) {
      console.warn('⚠️ Redis not available:', error.message);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client) return;
    await this.client.setex(key, seconds, value);
  }

  async exists(key: string): Promise<number> {
    if (!this.client) return 0;
    return this.client.exists(key);
  }

  async del(key: string): Promise<number> {
    if (!this.client) return 0;
    return this.client.del(key);
  }
}

