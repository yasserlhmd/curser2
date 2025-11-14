import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigService as AppConfigService } from './config.service';

@Module({
  providers: [AppConfigService, ConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}

