import { Module, Global } from '@nestjs/common';
import { TokenRevocationService } from './token-revocation.service';
import { RedisModule } from '../redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [TokenRevocationService],
  exports: [TokenRevocationService],
})
export class TokenRevocationModule {}

