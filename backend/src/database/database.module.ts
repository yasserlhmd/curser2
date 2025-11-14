import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ConfigService as AppConfigService } from '../config/config.service';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const appConfigService = new AppConfigService(configService);
        const dbConfig = appConfigService.database;
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [User, Task],
          synchronize: false, // Use migrations instead
          logging: appConfigService.isDevelopment(),
          ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Task]),
  ],
  providers: [DatabaseService],
  exports: [TypeOrmModule, DatabaseService],
})
export class DatabaseModule {}

