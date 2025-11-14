import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { TokenRevocationModule } from './token-revocation/token-revocation.module';
import { RedisModule } from './redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AppConfigModule,
    
    // Infrastructure
    RedisModule,
    DatabaseModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    TasksModule,
    TokenRevocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

